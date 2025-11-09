export class CryptoWebSocket {
	private ws: WebSocket | null = null
	private subscribers: ((data: any) => void)[] = []

	constructor(private url: string) {}

	connect() {
		this.ws = new WebSocket(this.url)

		this.ws.onmessage = event => {
			const data = JSON.parse(event.data)
			this.subscribers.forEach(callback => callback(data))
		}

		this.ws.onclose = () => {
			setTimeout(() => this.connect(), 5000)
		}

		this.ws.onerror = error => {
			console.error('WebSocket error:', error)
			this.ws?.close()
		}
	}

	subscribe(callback: (data: any) => void) {
		this.subscribers.push(callback)
		return () => {
			this.subscribers = this.subscribers.filter(cb => cb !== callback)
		}
	}

	disconnect() {
		this.ws?.close()
		this.subscribers = []
	}
}
