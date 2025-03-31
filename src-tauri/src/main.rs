// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use sqlx::{MySql, Pool, MySqlPool};
use tauri::State;
use serde::Serialize;
use chrono::DateTime as ChronoDateTime;
use chrono::Utc;
use std::env;

// Define a struct matching the `proven_txs` table
#[derive(Serialize)]
#[allow(non_snake_case)]
struct ProvenTx {
    provenTxId: u32,
    txid: String,
    height: u32,
    index: u32,
    merklePath: Option<Vec<u8>>,
    rawTx: Option<Vec<u8>>,
    blockHash: String,
    merkleRoot: String,
    created_at: ChronoDateTime<Utc>,
    updated_at: ChronoDateTime<Utc>,
}

// State to hold the database connection pool
struct AppState {
    db: Pool<MySql>,
}

// Command to fetch all proven transactions
#[tauri::command]
async fn get_proven_txs(state: State<'_, AppState>) -> Result<Vec<ProvenTx>, String> {
    let rows = sqlx::query_as!(
        ProvenTx,
        "SELECT provenTxId, txid, height, `index`, merklePath, rawTx, blockHash, merkleRoot, created_at, updated_at FROM proven_txs"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(rows)
}

#[tokio::main]
async fn main() {
    let database_url = env::var("MYSQL_WALLET_STORAGE_URL").expect("MYSQL_WALLET_STORAGE_URL must be set");
    // Initialize the database connection pool
    let db_pool = MySqlPool::connect(&database_url)
        .await
        .expect("Failed to connect to MySQL");

    tauri::Builder::default()
        .manage(AppState { db: db_pool })
        .invoke_handler(tauri::generate_handler![get_proven_txs])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}