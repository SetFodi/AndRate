use std::path::PathBuf;
use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use tauri::{State, Manager};
use dotenvy::dotenv;
use argon2::{Argon2, password_hash::{SaltString, PasswordHash, PasswordHasher, PasswordVerifier}};
use reqwest::Client;

#[derive(Debug)]
struct AppDb(PathBuf);

fn db_path(app: &tauri::AppHandle) -> PathBuf {
  let dir = app.path().app_data_dir().expect("app data dir");
  std::fs::create_dir_all(&dir).ok();
  dir.join("andrate.sqlite3")
}

fn init_db(conn: &Connection) -> rusqlite::Result<()> {
  conn.execute_batch(
    r#"
    PRAGMA foreign_keys=ON;
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      item_type TEXT NOT NULL, -- anime | tv | movie
      title TEXT NOT NULL,
      poster_url TEXT,
      status TEXT NOT NULL, -- planning | watching | completed | abandoned
      rating REAL,
      UNIQUE(user_id, item_id, item_type),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    "#,
  )?;
  Ok(())
}

fn open_conn(path: &PathBuf) -> rusqlite::Result<Connection> {
  let conn = Connection::open(path)?;
  conn.execute_batch("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;")?;
  Ok(conn)
}

#[derive(Deserialize)]
struct RegisterPayload { username: String, password: String }

#[derive(Serialize)]
struct AuthResponse { user_id: i64, username: String }

#[tauri::command]
fn register_user(state: State<AppDb>, payload: RegisterPayload) -> Result<AuthResponse, String> {
  // Validation
  if payload.username.trim().is_empty() {
    return Err("Username cannot be empty".to_string());
  }
  if payload.username.len() < 3 {
    return Err("Username must be at least 3 characters long".to_string());
  }
  if payload.username.len() > 50 {
    return Err("Username must be less than 50 characters long".to_string());
  }
  if payload.password.len() < 6 {
    return Err("Password must be at least 6 characters long".to_string());
  }
  if payload.password.len() > 100 {
    return Err("Password must be less than 100 characters long".to_string());
  }
  
  let Ok(conn) = open_conn(&state.0) else { return Err("Database connection error".into()) };
  
  // Check if username already exists
  let mut stmt = conn.prepare("SELECT COUNT(*) FROM users WHERE username = ?1")
    .map_err(|_| "Database error".to_string())?;
  let count: i64 = stmt.query_row(params![payload.username.trim()], |row| row.get(0))
    .map_err(|_| "Database error".to_string())?;
  
  if count > 0 {
    return Err("Username already exists".to_string());
  }
  
  let salt = SaltString::generate(&mut rand_core::OsRng);
  let hash = Argon2::default()
    .hash_password(payload.password.as_bytes(), &salt)
    .map_err(|_| "Password hashing failed".to_string())?
    .to_string();
  
  conn.execute(
    "INSERT INTO users (username, password_hash) VALUES (?1, ?2)",
    params![payload.username.trim(), hash],
  ).map_err(|_| "Failed to create user".to_string())?;
  
  let id = conn.last_insert_rowid();
  Ok(AuthResponse { user_id: id, username: payload.username.trim().to_string() })
}

#[derive(Deserialize)]
struct LoginPayload { username: String, password: String }

#[tauri::command]
fn login_user(state: State<AppDb>, payload: LoginPayload) -> Result<AuthResponse, String> {
  // Validation
  if payload.username.trim().is_empty() {
    return Err("Username cannot be empty".to_string());
  }
  if payload.password.is_empty() {
    return Err("Password cannot be empty".to_string());
  }
  
  let Ok(conn) = open_conn(&state.0) else { return Err("Database connection error".into()) };
  let mut stmt = conn.prepare("SELECT id, password_hash, username FROM users WHERE username = ?1")
    .map_err(|_| "Database error".to_string())?;
  let row = stmt.query_row(params![payload.username.trim()], |row| {
    let id: i64 = row.get(0)?;
    let hash: String = row.get(1)?;
    let username: String = row.get(2)?;
    Ok((id, hash, username))
  }).map_err(|_| "Invalid username or password".to_string())?;

  let parsed_hash = PasswordHash::new(&row.1).map_err(|_| "Invalid username or password".to_string())?;
  let valid = Argon2::default().verify_password(payload.password.as_bytes(), &parsed_hash).is_ok();
  if !valid { return Err("Invalid username or password".into()); }
  Ok(AuthResponse { user_id: row.0, username: row.2 })
}

#[derive(Deserialize)]
struct UpsertLibraryPayload {
  user_id: i64,
  item_id: String,
  item_type: String,
  title: String,
  poster_url: Option<String>,
  status: String,
  rating: Option<f64>,
}

#[tauri::command]
fn upsert_library(state: State<AppDb>, payload: UpsertLibraryPayload) -> Result<(), String> {
  let Ok(conn) = open_conn(&state.0) else { return Err("database open error".into()) };
  conn.execute(
    r#"
    INSERT INTO library (user_id, item_id, item_type, title, poster_url, status, rating)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    ON CONFLICT(user_id, item_id, item_type) DO UPDATE SET
      title=excluded.title,
      poster_url=excluded.poster_url,
      status=excluded.status,
      rating=excluded.rating
    "#,
    params![
      payload.user_id,
      payload.item_id,
      payload.item_type,
      payload.title,
      payload.poster_url,
      payload.status,
      payload.rating
    ],
  ).map_err(|e| e.to_string())?;
  Ok(())
}

#[derive(Deserialize)]
struct QueryLibraryPayload { user_id: i64, item_type: Option<String>, status: Option<String> }

#[derive(Serialize)]
struct LibraryItem {
  id: i64,
  item_id: String,
  item_type: String,
  title: String,
  poster_url: Option<String>,
  status: String,
  rating: Option<f64>,
}

#[tauri::command]
fn get_library(state: State<AppDb>, payload: QueryLibraryPayload) -> Result<Vec<LibraryItem>, String> {
  let Ok(conn) = open_conn(&state.0) else { return Err("database open error".into()) };
  let mut query = String::from("SELECT id, item_id, item_type, title, poster_url, status, rating FROM library WHERE user_id = ?");
  let mut values: Vec<rusqlite::types::Value> = vec![rusqlite::types::Value::Integer(payload.user_id)];
  if let Some(t) = &payload.item_type { query.push_str(" AND item_type = ?"); values.push(rusqlite::types::Value::Text(t.clone())); }
  if let Some(s) = &payload.status { query.push_str(" AND status = ?"); values.push(rusqlite::types::Value::Text(s.clone())); }

  let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
  let rows = stmt.query_map(rusqlite::params_from_iter(values.iter()), |row| {
    Ok(LibraryItem{
      id: row.get(0)?,
      item_id: row.get(1)?,
      item_type: row.get(2)?,
      title: row.get(3)?,
      poster_url: row.get(4)?,
      status: row.get(5)?,
      rating: row.get(6)?,
    })
  }).map_err(|e| e.to_string())?;
  Ok(rows.filter_map(Result::ok).collect())
}

#[derive(Serialize)]
struct SearchItem {
  item_id: String,
  item_type: String,
  title: String,
  poster_url: Option<String>,
  overview: Option<String>,
  community_rating: Option<f64>,
  community_rating_count: Option<i32>,
}

#[derive(Serialize)]
struct DetailItem {
  item_id: String,
  item_type: String,
  title: String,
  poster_url: Option<String>,
  overview: Option<String>,
  year: Option<i32>,
  genres: Vec<String>,
  community_rating: Option<f64>,
  community_rating_count: Option<i32>,
}

#[tauri::command]
async fn search_anime(query: String) -> Result<Vec<SearchItem>, String> {
  let client = Client::new();
  let body = serde_json::json!({
    "query": r#"query ($query: String) { Page(perPage: 12) { media(search: $query, type: ANIME) { id title { romaji english native } coverImage { large } description(asHtml: false) averageScore meanScore } } }"#,
    "variables": { "query": query }
  });
  let res = client
    .post("https://graphql.anilist.co")
    .json(&body)
    .send().await.map_err(|e| e.to_string())?
    .json::<serde_json::Value>().await.map_err(|e| e.to_string())?;
  let mut items = Vec::new();
  if let Some(arr) = res["data"]["Page"]["media"].as_array() {
    for m in arr {
      let id = m["id"].to_string();
      let title = m["title"]["english"].as_str()
        .or(m["title"]["romaji"].as_str())
        .or(m["title"]["native"].as_str())
        .unwrap_or("")
        .to_string();
      let poster = m["coverImage"]["large"].as_str().map(|s| s.to_string());
      let overview = m["description"].as_str().map(|s| s.to_string());
      let community_rating = m["averageScore"].as_f64().map(|score| score / 10.0);
      let community_rating_count = None;
      items.push(SearchItem { item_id: id, item_type: "anime".into(), title, poster_url: poster, overview, community_rating, community_rating_count });
    }
  }
  Ok(items)
}

#[tauri::command]
async fn search_tmdb(kind: String, query: String) -> Result<Vec<SearchItem>, String> {
  let client = Client::new();
  let url_base = format!("https://api.themoviedb.org/3/search/{kind}?query={}", urlencoding::encode(&query));
  let mut req = client.get(&url_base).header("Accept", "application/json");
  if let Ok(bearer) = std::env::var("TMDB_BEARER") {
    req = req.header("Authorization", format!("Bearer {}", bearer));
  } else if let Ok(api_key) = std::env::var("TMDB_API_KEY") {
    // v3 API key via query param
    let url_with_key = format!("{}&api_key={}", url_base, api_key);
    req = client.get(&url_with_key).header("Accept", "application/json");
  } else {
    return Err("Set TMDB_BEARER (v4) or TMDB_API_KEY (v3)".into());
  }
  let res = req
    .send().await.map_err(|e| e.to_string())?
    .json::<serde_json::Value>().await.map_err(|e| e.to_string())?;
  let mut items = Vec::new();
  if let Some(arr) = res["results"].as_array() {
    for r in arr {
      let id = r["id"].to_string();
      let title = if kind == "movie" { r["title"].as_str() } else { r["name"].as_str() }
        .unwrap_or("")
        .to_string();
      let poster_path = r["poster_path"].as_str();
      let poster_url = poster_path.map(|p| format!("https://image.tmdb.org/t/p/w500{}", p));
      let overview = r["overview"].as_str().map(|s| s.to_string());
      let community_rating = r["vote_average"].as_f64();
      let community_rating_count = r["vote_count"].as_i64().map(|c| c as i32);
      items.push(SearchItem { item_id: id, item_type: kind.clone(), title, poster_url, overview, community_rating, community_rating_count });
    }
  }
  Ok(items)
}

#[tauri::command]
async fn discover_anime(page: Option<u32>) -> Result<Vec<SearchItem>, String> {
  let page = page.unwrap_or(1);
  let client = Client::new();
  let body = serde_json::json!({
    "query": r#"query ($page: Int) { Page(page: $page, perPage: 24) { media(type: ANIME, sort: TRENDING_DESC) { id title { romaji english native } coverImage { large } description(asHtml: false) } } }"#,
    "variables": { "page": page as i32 }
  });
  let res = client
    .post("https://graphql.anilist.co")
    .json(&body)
    .send().await.map_err(|e| e.to_string())?
    .json::<serde_json::Value>().await.map_err(|e| e.to_string())?;
  let mut items = Vec::new();
  if let Some(arr) = res["data"]["Page"]["media"].as_array() {
    for m in arr {
      let id = m["id"].to_string();
      let title = m["title"]["english"].as_str()
        .or(m["title"]["romaji"].as_str())
        .or(m["title"]["native"].as_str())
        .unwrap_or("")
        .to_string();
      let poster = m["coverImage"]["large"].as_str().map(|s| s.to_string());
      let overview = m["description"].as_str().map(|s| s.to_string());
      let community_rating = m["averageScore"].as_f64().map(|score| score / 10.0);
      let community_rating_count = None;
      items.push(SearchItem { item_id: id, item_type: "anime".into(), title, poster_url: poster, overview, community_rating, community_rating_count });
    }
  }
  Ok(items)
}

#[tauri::command]
async fn discover_tmdb(kind: String, page: Option<u32>) -> Result<Vec<SearchItem>, String> {
  let page = page.unwrap_or(1);
  let client = Client::new();
  let base = format!("https://api.themoviedb.org/3/discover/{kind}?sort_by=popularity.desc&page={}", page);
  let mut req = client.get(&base).header("Accept", "application/json");
  if let Ok(bearer) = std::env::var("TMDB_BEARER") {
    req = req.header("Authorization", format!("Bearer {}", bearer));
  } else if let Ok(api_key) = std::env::var("TMDB_API_KEY") {
    let with_key = format!("{}&api_key={}", base, api_key);
    req = client.get(&with_key).header("Accept", "application/json");
  } else {
    return Err("Set TMDB_BEARER (v4) or TMDB_API_KEY (v3)".into());
  }
  let res = req
    .send().await.map_err(|e| e.to_string())?
    .json::<serde_json::Value>().await.map_err(|e| e.to_string())?;
  let mut items = Vec::new();
  if let Some(arr) = res["results"].as_array() {
    for r in arr {
      let id = r["id"].to_string();
      let title = if kind == "movie" { r["title"].as_str() } else { r["name"].as_str() }
        .unwrap_or("")
        .to_string();
      let poster_path = r["poster_path"].as_str();
      let poster_url = poster_path.map(|p| format!("https://image.tmdb.org/t/p/w500{}", p));
      let overview = r["overview"].as_str().map(|s| s.to_string());
      let community_rating = r["vote_average"].as_f64();
      let community_rating_count = r["vote_count"].as_i64().map(|c| c as i32);
      items.push(SearchItem { item_id: id, item_type: kind.clone(), title, poster_url, overview, community_rating, community_rating_count });
    }
  }
  Ok(items)
}

#[tauri::command]
async fn get_anime_detail(id: String) -> Result<DetailItem, String> {
  let client = Client::new();
  let body = serde_json::json!({
    "query": r#"query ($id: Int) { Media(id: $id, type: ANIME) { id title { romaji english native } coverImage { large } description(asHtml: false) seasonYear genres } }"#,
    "variables": { "id": id.parse::<i32>().unwrap_or_default() }
  });
  let res = client
    .post("https://graphql.anilist.co")
    .json(&body)
    .send().await.map_err(|e| e.to_string())?
    .json::<serde_json::Value>().await.map_err(|e| e.to_string())?;
  let m = &res["data"]["Media"];
  let item_id = m["id"].to_string();
  let title = m["title"]["english"].as_str()
    .or(m["title"]["romaji"].as_str())
    .or(m["title"]["native"].as_str())
    .unwrap_or("").to_string();
  let poster_url = m["coverImage"]["large"].as_str().map(|s| s.to_string());
  let overview = m["description"].as_str().map(|s| s.to_string());
  let year = m["seasonYear"].as_i64().map(|y| y as i32);
  let genres = m["genres"].as_array().map(|arr| arr.iter().filter_map(|g| g.as_str().map(|s| s.to_string())).collect()).unwrap_or_default();
  let community_rating = m["averageScore"].as_f64().map(|score| score / 10.0);
  let community_rating_count = None;
  Ok(DetailItem { item_id, item_type: "anime".into(), title, poster_url, overview, year, genres, community_rating, community_rating_count })
}

#[tauri::command]
async fn get_tmdb_detail(kind: String, id: String) -> Result<DetailItem, String> {
  let client = Client::new();
  let mut base = format!("https://api.themoviedb.org/3/{}/{}", if kind == "movie" { "movie" } else { "tv" }, id);
  let mut req = client.get(&base).header("Accept", "application/json");
  if let Ok(bearer) = std::env::var("TMDB_BEARER") {
    req = req.header("Authorization", format!("Bearer {}", bearer));
  } else if let Ok(api_key) = std::env::var("TMDB_API_KEY") {
    base = format!("{}?api_key={}", base, api_key);
    req = client.get(&base).header("Accept", "application/json");
  } else {
    return Err("Set TMDB_BEARER (v4) or TMDB_API_KEY (v3)".into());
  }
  let res = req.send().await.map_err(|e| e.to_string())?
    .json::<serde_json::Value>().await.map_err(|e| e.to_string())?;
  let item_id = res["id"].to_string();
  let title = if kind == "movie" { res["title"].as_str() } else { res["name"].as_str() }
    .unwrap_or("").to_string();
  let poster_path = res["poster_path"].as_str();
  let poster_url = poster_path.map(|p| format!("https://image.tmdb.org/t/p/w500{}", p));
  let overview = res["overview"].as_str().map(|s| s.to_string());
  let year_str = if kind == "movie" { res["release_date"].as_str() } else { res["first_air_date"].as_str() };
  let year = year_str.and_then(|s| s.get(0..4)).and_then(|y| y.parse::<i32>().ok());
  let genres = res["genres"].as_array().map(|arr| arr.iter().filter_map(|g| g["name"].as_str().map(|s| s.to_string())).collect()).unwrap_or_default();
  let community_rating = res["vote_average"].as_f64();
  let community_rating_count = res["vote_count"].as_i64().map(|c| c as i32);
  Ok(DetailItem { item_id, item_type: kind, title, poster_url, overview, year, genres, community_rating, community_rating_count })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      dotenv().ok();
      let path = db_path(&app.handle());
      let conn = Connection::open(&path).map_err(|e| anyhow::anyhow!(e.to_string()))?;
      init_db(&conn).map_err(|e| anyhow::anyhow!(e.to_string()))?;
      app.manage(AppDb(path));
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      register_user,
      login_user,
      upsert_library,
      get_library,
      search_anime,
      search_tmdb,
      discover_anime,
      discover_tmdb,
      get_anime_detail,
      get_tmdb_detail,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
