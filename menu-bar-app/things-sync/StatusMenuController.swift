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
		callNodeServer(path: "exit")
		DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
			NSApplication.shared.terminate(self)
		}
	}

	@IBAction func sendTestRequest(_ sender: NSMenuItem) {
		callNodeServer(path: "test")
	}

	@IBAction func syncGitHubProjects(_ sender: NSMenuItem) {
		callNodeServer(path: "sync-github-projects")
	}

}
