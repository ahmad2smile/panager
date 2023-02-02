use lopdf::content::Operation;

use lopdf::Document;
use lopdf::Object;
use lopdf::Result;

use std::fs;
use std::path;

pub fn add_header<'a>(
    header_text: &'a str,
    file: &'a str,
    dest_name: &'a str,
    dest_path: &'a str,
) -> Result<&'a str> {
    let file = path::Path::new(&file);

    let doc_mem = fs::read(file.as_os_str())?;

    let mut doc = Document::load_mem(&doc_mem).unwrap_or_default();

    let page_id = *doc.get_pages().get(&1).unwrap_or(&(0, 0));

    let mut content = doc.get_and_decode_page_content(page_id).unwrap();

    let fonts = doc
        .get_page_fonts(page_id)
        .into_iter()
        .map(|(name, _)| name)
        .collect::<Vec<_>>();
    let current_font = vec![];
    let current_font = fonts.first().unwrap_or(&current_font);
    let current_font = std::str::from_utf8(&current_font).unwrap_or("F1");

    let mut operations = vec![
        Operation::new("BT", vec![]),
        Operation::new("Tf", vec![current_font.into(), 12.into()]),
        Operation::new("Td", vec![20.into(), 770.into()]),
        Operation::new("Tj", vec![Object::string_literal(header_text)]),
        Operation::new("ET", vec![]),
    ];

    content.operations.append(&mut operations);

    doc.change_page_content(page_id, content.encode().unwrap())
        .unwrap();

    doc.adjust_zero_pages();

    let _ = fs::create_dir_all(dest_path);
    let dest_file = format!("{dest_path}/{dest_name}");
    let dest_file = path::Path::new(&dest_file);

    doc.save(dest_file).unwrap();

    Ok(dest_name)
}
