import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {

	func applicationDidFinishLaunching(_ aNotification: Notification) {
		NSAppleEventManager.shared().setEventHandler(
			self,
			andSelector: #selector(AppDelegate.handleGetURLEvent(event:replyEvent:)),
			forEventClass: AEEventClass(kInternetEventClass),
			andEventID: AEEventID(kAEGetURL)
		)
	}

	func applicationWillTerminate(_ aNotification: Notification) {}

	@objc func handleGetURLEvent(event: NSAppleEventDescriptor, replyEvent: NSAppleEventDescriptor?) {
		let urlString = event.paramDescriptor(forKeyword: AEKeyword(keyDirectObject))?.stringValue!
		print(urlString!)
	}
}

