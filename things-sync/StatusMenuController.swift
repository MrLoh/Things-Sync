import Cocoa

class StatusMenuController: NSObject {
	@IBOutlet weak var statusMenu: NSMenu!

	let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)

	override func awakeFromNib() {
		let icon = NSImage(named: NSImage.Name(rawValue: "statusIcon"))
		icon?.isTemplate = true
		statusItem.image = icon
		statusItem.menu = statusMenu
	}


	@IBAction func quitClicked(_ sender: NSMenuItem) {
		NSApplication.shared.terminate(self)
	}

	@IBAction func addTask(_ sender: NSMenuItem) {
		request(url: "http://localhost:4567/test")
	}

}
