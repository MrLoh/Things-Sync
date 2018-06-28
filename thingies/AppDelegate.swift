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
		let icon = NSImage(named: NSImage.Name(rawValue: "statusIcon"))
		icon?.isTemplate = true
		statusItem.image = icon
		statusItem.menu = statusMenu
	}

	func applicationWillTerminate(_ aNotification: Notification) {
		// Insert code here to tear down your application
	}


}

