import Foundation

let BASE_URL = "http://localhost:4567"

func callNodeServer(path: String) {
	let url = "\(BASE_URL)/\(path)"
	// print("requesting /\(path)")
	let task = URLSession.shared.dataTask(with: URL(string: url)!) { (data, response, error) in
		guard error == nil else {
			print("error: \(error!.localizedDescription)")
			return
		}
		guard let body = String(data: data!, encoding: String.Encoding.utf8) else {
			print("error: empty response")
			return
		}
		print("> \(body)")
	}
	task.resume()
}
