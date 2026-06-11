import Foundation

@objc(SharedPrefs)
class SharedPrefsModule: NSObject {
  private let suiteName = "group.com.klavyem.shared"

  private var defaults: UserDefaults? {
    UserDefaults(suiteName: suiteName)
  }

  @objc func setAppGroupString(_ key: String, value: String) {
    defaults?.set(value, forKey: key)
    defaults?.synchronize()
  }

  @objc func setKeyboardData(_ encoded: String) {
    defaults?.set(encoded, forKey: "keyboard_data")
    defaults?.synchronize()
  }

  @objc func setKeyboardTheme(_ theme: String) {
    defaults?.set(theme, forKey: "keyboard_theme")
    defaults?.synchronize()
  }

  @objc func clearAppGroup() {
    guard let ud = defaults else { return }
    ud.dictionaryRepresentation().keys.forEach { ud.removeObject(forKey: $0) }
    ud.synchronize()
  }

  @objc static func requiresMainQueueSetup() -> Bool { false }
}
