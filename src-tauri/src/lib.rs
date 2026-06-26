use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    Emitter,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let about = MenuItem::with_id(app, "about", "About Subtext", true, None::<&str>)?;
            let settings = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let app_menu = Submenu::with_items(
                app,
                "Subtext",
                true,
                &[&about, &settings, &separator, &quit],
            )?;
            let menu = Menu::with_items(app, &[&app_menu])?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| match event.id().as_ref() {
            "about" => {
                let _ = app.emit("app://menu", "about");
            }
            "settings" => {
                let _ = app.emit("app://menu", "settings");
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
