import Foundation

func request(url: String) {
	let task = URLSession.shared.dataTask(with: URL(string: url)!) { data, error, _   in
		if (error != nil){
			print("error: \(String(describing: error))")
		} else if (data != nil) {
			print("response: \(String(describing: data))")
		}
	}
	task.resume()
}
