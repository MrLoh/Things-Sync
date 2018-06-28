//
//  AppDelegate.swift
//  thingies
//
//  Created by Tobias Lohse on 28.6.2018.
//  Copyright © 2018 Tobias Lohse. All rights reserved.
//

import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {

	@IBOutlet weak var statusMenu: NSMenu!
	let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)


	@IBAction func quitClicked(_ sender: NSMenuItem) {
		NSApplication.shared.terminate(self)
	}

	func applicationDidFinishLaunching(_ aNotification: Notification) {
		statusItem.title = "Thingies"
		statusItem.menu = statusMenu
	}

	func applicationWillTerminate(_ aNotification: Notification) {
		// Insert code here to tear down your application
	}


}

