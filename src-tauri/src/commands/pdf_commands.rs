#[tauri::command]
pub fn pdf_extract_text(path: &str) -> Result<String, String> {
    Ok(pdf_extract::extract_text(path)
        .map_err(|_| format!("Extracting text from pdf failed at path: {path}"))?)
}
