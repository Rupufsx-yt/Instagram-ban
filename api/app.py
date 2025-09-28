from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import random
import threading
import time
import json

app = Flask(__name__)
CORS(app)

# Mass Report Engine
class InstagramReporter:
    def __init__(self):
        self.active_attacks = {}
        self.proxy_list = []
    
    def load_proxies(self):
        """Load proxies from multiple sources"""
        sources = [
            "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http",
            "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt"
        ]
        
        for source in sources:
            try:
                response = requests.get(source, timeout=10)
                proxies = response.text.strip().split('\n')
                self.proxy_list.extend([p.strip() for p in proxies if p.strip()])
            except:
                pass
        
        self.proxy_list = list(set(self.proxy_list))
        return len(self.proxy_list)
    
    def send_report(self, username, attack_id):
        """Send single Instagram report"""
        try:
            proxy = random.choice(self.proxy_list) if self.proxy_list else None
            proxies = {'http': f'http://{proxy}', 'https': f'http://{proxy}'} if proxy else None
            
            # Instagram report simulation
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            response = requests.post(
                'https://www.instagram.com/ajax/report/',
                headers=headers,
                proxies=proxies,
                timeout=15
            )
            
            return response.status_code == 200
        except:
            return False
    
    def start_attack(self, username, report_count, attack_id):
        """Start mass report attack"""
        self.active_attacks[attack_id] = {
            'username': username,
            'total': report_count,
            'success': 0,
            'failed': 0,
            'active': True
        }
        
        def attack_thread():
            for i in range(report_count):
                if not self.active_attacks[attack_id]['active']:
                    break
                
                if self.send_report(username, attack_id):
                    self.active_attacks[attack_id]['success'] += 1
                else:
                    self.active_attacks[attack_id]['failed'] += 1
                
                time.sleep(random.uniform(1, 3))  # Delay between reports
            
            self.active_attacks[attack_id]['active'] = False
        
        threading.Thread(target=attack_thread, daemon=True).start()
        return attack_id

reporter = InstagramReporter()

# API Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/start-attack', methods=['POST'])
def start_attack():
    data = request.json
    username = data.get('username')
    count = data.get('count', 100)
    
    if not username:
        return jsonify({'error': 'Username required'}), 400
    
    attack_id = f"{username}_{int(time.time())}"
    reporter.load_proxies()
    reporter.start_attack(username, count, attack_id)
    
    return jsonify({
        'attack_id': attack_id,
        'message': f'Attack started on @{username} with {count} reports',
        'proxies_loaded': len(reporter.proxy_list)
    })

@app.route('/api/attack-status/<attack_id>')
def attack_status(attack_id):
    if attack_id not in reporter.active_attacks:
        return jsonify({'error': 'Attack not found'}), 404
    
    attack = reporter.active_attacks[attack_id]
    return jsonify({
        'username': attack['username'],
        'success': attack['success'],
        'failed': attack['failed'],
        'total': attack['total'],
        'progress': ((attack['success'] + attack['failed']) / attack['total']) * 100,
        'active': attack['active']
    })

@app.route('/api/stop-attack/<attack_id>', methods=['POST'])
def stop_attack(attack_id):
    if attack_id in reporter.active_attacks:
        reporter.active_attacks[attack_id]['active'] = False
        return jsonify({'message': 'Attack stopped'})
    return jsonify({'error': 'Attack not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
