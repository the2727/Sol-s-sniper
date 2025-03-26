import json
import configparser
import re
import os
import sys
import time
import threading
import selfcord
import requests
from pynput import keyboard
from selfcord.ext import commands
from windows_toasts import AudioSource, Toast, ToastAudio, WindowsToaster
import webview
import re

toaster = WindowsToaster('Sniper')
newToast = Toast()
base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
snipercat_path = os.path.join(base_path, 'snipercat.png')

KEYWORDS_FILE = "keywords.json"
SERVERS_FILE = "servers.json"
CONFIG_FILE = "sniper_config.ini"

config = configparser.ConfigParser()
url_pattern = re.compile(r'https?://[^\s]+')
game_pattern = r"https:\/\/www\.roblox\.com\/games\/(\d+)\/[^?]+\?privateServerLinkCode=(\d+)"
share_pattern = r"https:\/\/www\.roblox\.com\/share\?code=([a-f0-9]+)&type=([A-Za-z]+)"
timer_running = False

global open_roblox_toggle,stop_sniper_toggle,open_roblox_key,stop_sniper_key
global glitchsniping,dreamsniping,jestersniping,voidcoinsniping,toast_notifications



def save_lists_to_json(data, filename):
    if not data:
        print("No data was retrieved.")
        return

    categories = {
        "disallowed(bot)": data.get("disallowed", []),
        "allowedGlitch(bot)": data.get("allowedG", []),
        "allowedjester(bot)": data.get("allowedJ", []),
        "allowedVoidCoin(bot)": data.get("allowedV", []),
        "allowedDreamSpace(bot)": data.get("allowedD", []),
        "Glitchdisallowed(bot)": data.get("Gdisallowed", []),
        "Jesterdisallowed(bot)": data.get("Jdisallowed", []),
        "VoidCoinDisallowed(bot)": data.get("Vdisallowed", []),
        "DreamSpacedisallowed(bot)": data.get("Ddisallowed", []),
    }

    formatted_data = [{'name': category, "ids": keywords} for category, keywords in categories.items()]

    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            try:
                existing_data = json.load(f)
            except json.JSONDecodeError:
                existing_data = []
    else:
        existing_data = []


    existing_data = [entry for entry in existing_data if entry['name'] not in categories]


    existing_data.extend(formatted_data)


    with open(filename, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, indent=4)

    print(f"Data successfully updated in {filename}")

def convert_spaces(text):
    return text.replace("<space>", " ")

def read_file():
    response = requests.get("https://raw.githubusercontent.com/dannws/keywords/refs/heads/main/keywords.json")
    if response.status_code == 200:
        data = response.json() 
        return data
    else:
        print(f"Failed to read file: {response.status_code}, {response.text}")
        return None

data = read_file()

if data: 
    data["disallowed"] = [convert_spaces(keyword) for keyword in data["disallowed"]]
    data["allowedG"] = [convert_spaces(keyword) for keyword in data["allowedG"]]
    data["allowedJ"] = [convert_spaces(keyword) for keyword in data["allowedJ"]]
    data["allowedV"] = [convert_spaces(keyword) for keyword in data["allowedV"]]
    data["allowedD"] = [convert_spaces(keyword) for keyword in data["allowedD"]]
    data["Gdisallowed"] = [convert_spaces(keyword) for keyword in data["Gdisallowed"]]
    data["Jdisallowed"] = [convert_spaces(keyword) for keyword in data["Jdisallowed"]]
    data["Vdisallowed"] = [convert_spaces(keyword) for keyword in data["Vdisallowed"]]
    data["Ddisallowed"] = [convert_spaces(keyword) for keyword in data["Ddisallowed"]]
    blockedUsers = data["blocked_users_ids"]
    save_lists_to_json(data,"keywords.json")

else:
    print("No data was retrieved.")

def load_settings():
    if os.path.exists(CONFIG_FILE):
        global token
        global open_roblox_toggle,stop_sniper_toggle,open_roblox_key,stop_sniper_key
        global glitchsniping,dreamsniping,jestersniping,voidcoinsniping,toast_notifications

        config.read(CONFIG_FILE)

        token = config['sniping'].get('token', '')

        glitchsniping = config['sniping'].get('glitchsniping',"None")
        dreamsniping = config['sniping'].get('dreamsniping',"None")
        jestersniping = config['sniping'].get('glitchsniping',"None")
        voidcoinsniping = config['sniping'].get('voidcoinsniping',"None")
        toast_notifications = config['sniping'].get('toast_notifications',"None")
        
        open_roblox_toggle = config['Hotkeys'].get('open_roblox_toggle','None')
        open_roblox_key = config["Hotkeys"].get('open_roblox','None')
        stop_sniper_toggle = config['Hotkeys'].get('stop_sniper_toggle','None')
        stop_sniper_key = config["Hotkeys"].get('stop_sniper','None')

    else:

        config['sniping'] = {
            'glitchsniping': 'False',
            'dreamsniping': 'False',
            'jestersniping': 'False',
            'voidCoinsniping': 'False',
            'toast_notifications': 'True',
            'token': ''
        }
        config['Hotkeys'] = {
            'open_roblox': '-',
            'open_roblox_toggle': 'True',
            'stop_sniper': '[',
            'stop_sniper_toggle': 'True'
        }

load_settings()

def fetch_avatar(user_id, filename):
    url = f"https://discordlookup.mesalytic.moe/v1/user/{user_id}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        avatar_link = data.get("avatar", {}).get("link")
        
        if avatar_link:
            img_response = requests.get(avatar_link)
            if img_response.status_code == 200:
                os.makedirs("ui/media", exist_ok=True)
                with open(f"ui/media/{filename}.png", "wb") as f:
                    f.write(img_response.content)
            else:
                pass
        else:
            pass
    else:
        print(f"Failed to fetch data for {user_id}")

DATA_FILE = "currentKeyword.json"

class keywordAPI:

    def load_keywords_names(self):
        if os.path.exists(KEYWORDS_FILE):
            try:
                with open(KEYWORDS_FILE, "r", encoding="utf-8") as f:
                    json_data =  json.load(f)
                    return [item['name'] for item in json_data]
            except json.JSONDecodeError:
                print("Error: Could not parse keywords.json. Resetting file.")
                return []
        return []

    def save_all(self, data):
        with open(DATA_FILE, "w") as f:
            json.dump(data, f)

    def load_all(self):
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        return []

    def clear_all_unedited_keywords_data(self):
        if os.path.exists(DATA_FILE):
            os.remove(DATA_FILE)


class API:
    def __init__(self):
        global token
        global open_roblox_toggle,stop_sniper_toggle,open_roblox_key,stop_sniper_key
        global glitchsniping,dreamsniping,jestersniping,voidcoinsniping,toast_notifications
        self.keywords = self.load_keywords()
        self.keywordsNames = self.load_keywords_names()
        self.servers = self.load_servers()
        self.config = configparser.ConfigParser()
        self.clear_all_unedited_keywords_data()

    def get_sniping_config(self):

        config_values = {
            "glitchsniping": config['sniping'].getboolean('glitchsniping'),
            "dreamsniping": config['sniping'].getboolean('dreamsniping'),
            "jestersniping": config['sniping'].getboolean('jestersniping'),
            "voidcoinsniping": config['sniping'].getboolean('voidCoinsniping'),
            "toast_notifications": config['sniping'].getboolean('toast_notifications'),

            "token": config['sniping'].get('token', ''),

            "open_roblox": config['Hotkeys'].get('open_roblox'),
            "open_roblox_toggle": config['Hotkeys'].get('open_roblox_toggle'),
            "stop_sniper": config['Hotkeys'].get('stop_sniper'),
            "stop_sniper_toggle": config['Hotkeys'].get('stop_sniper_toggle')
        }
        return config_values

    def save_keywords_to_file(self,fullkeywords):
        with open("currentKeyword.json", "w") as file:
            json.dump(fullkeywords, file, indent=4)

    def load_all_current_keywords(self):
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        return []
    
    def set_token(self,string):
        global token
        token = re.sub(r'"', '', string)

    def send_sniping_config(self):
        config_values = self.get_sniping_config()
        return config_values

    def print(self, string):
        print(string)

    def toggle_settings(self, name, value):
        global glitchsniping, dreamsniping, jestersniping, voidcoinsniping, toast_notifications
        global open_roblox_toggle, stop_sniper_toggle

        value = eval(value.capitalize())

        settings_map = {
            "glitch": "glitchsniping",
            "dream": "dreamsniping",
            "jester": "jestersniping",
            "voidcoin": "voidcoinsniping",
            "toast": "toast_notifications",
            "checkbox1": "open_roblox_toggle",
            "checkbox2": "stop_sniper_toggle"
        }
        
        if name in settings_map:
            globals()[settings_map[name]] = value
        else:
            print("The name is incorrect: ", name)

    def export_keyword_data(self):
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data
            except json.JSONDecodeError:
                print("Error: Could not parse currentkeywords.json.")
                return []
        else:
            print("Error: currentkeywords.json file not found.")
            return []

    def clear_all_unedited_keywords_data(self):
        if os.path.exists(DATA_FILE):
            os.remove(DATA_FILE)

    def change_hotkey(self,hotkeyID,value):
        global open_roblox_key,stop_sniper_key
        if(str(hotkeyID) == "hotkey1"):
            open_roblox_key = value
            print(value," = ",open_roblox_key)
        elif(str(hotkeyID) == "hotkey2"):
            stop_sniper_key = value
            print(value," = ",stop_sniper_key)
        else:
            print("invalid id in change")

    def get_Hotkeys(self,hotkeyID):
        if(str(hotkeyID) == "hotkey1"):
            return str(open_roblox_key) 
        elif(str(hotkeyID) == "hotkey2"):
            return str(stop_sniper_key)
        else:
            print("invalid id in get")

    def get_token(self):
        return str(token)

    def save_server(self, server):
        server["fullkeywords"] = self.load_all_current_keywords()
        if os.path.exists(SERVERS_FILE):
            try:
                with open(SERVERS_FILE, "r", encoding="utf-8") as f:
                    servers = json.load(f)
            except json.JSONDecodeError:
                print("no file found.")
                servers = []
        else:
            servers = []
        
        updated = False
        for idx, existing_server in enumerate(servers):
            if existing_server['id'] == server['id']:  
                servers[idx] = server 
                updated = True
                break
        if not updated:
            servers.append(server)
        
        with open(SERVERS_FILE, "w", encoding="utf-8") as f:
            json.dump(servers, f, indent=4)
        print(f"Server '{server['name']}' saved/updated successfully.")
        

    def save_keywords(self, keywords):

        with open(KEYWORDS_FILE, "w", encoding="utf-8") as f:
            json.dump(keywords, f, indent=4)

    def load_servers(self):

        if os.path.exists(SERVERS_FILE):
            try:
                with open(SERVERS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except json.JSONDecodeError:
                print("Error: Could not parse servers.json. Resetting file.")
                return []
        return []

    def open_keyword_popup(self):
        keyword_api = keywordAPI()
        
        webview.create_window("Keyword Selection", html=self.get_keyword_html(), on_top=True, js_api=keyword_api , height=1000)
        webview.windows[0].evaluate_js("document.getElementById('keyword-container-popup').innerHTML = ''")
        webview.start()
        return self.get_selected_keywords()


    def get_keyword_html(self):

        html_path = os.path.join(os.path.dirname(__file__), "ui\keywordpopup\keyword_popup.html")
        js_path = os.path.join(os.path.dirname(__file__), "ui\keywordpopup\script.js")
        css_path = os.path.join(os.path.dirname(__file__), "ui\keywordpopup\style.css")

        with open(html_path, "r", encoding="utf-8") as file:
            html_content = file.read()


        with open(js_path, "r", encoding="utf-8") as file:
            js_content = file.read()
        with open(css_path, "r", encoding="utf-8") as file:
            css_content = file.read()


        keyword_list_options = ''.join(f'<option value="{item['name']}">{item['name']}</option>' for item in self.keywords)

        keyword_buttons = ''.join(f"""
            <div>
                <span>{kw}</span>
                <button onclick="toggleKeyword('{kw}', 'allowed')">✅</button>
                <button onclick="toggleKeyword('{kw}', 'disallowed')">❌</button>
            </div>
        """ for kw in self.keywords)

        html_content = html_content.replace("<!-- Options will be dynamically added -->", keyword_list_options)
        html_content = html_content.replace("<!-- Keyword buttons will be dynamically inserted here -->", keyword_buttons)


        html_content = html_content.replace('<script src="script.js"></script>', f'<script>{js_content}</script>')
        html_content = html_content.replace('<link rel="stylesheet" type="text/css" href="style.css">', f'<style>{css_content}</style>')

        return html_content

    def save_keywords(self, selected_keywords):
        self.selected_keywords = selected_keywords

    def get_selected_keywords(self):
        return [{'name': kw, "status": status} for kw, status in self.selected_keywords.items()]

    def close_window(self):
        webview.windows[1].destroy()

    def load_keywords(self):

        if os.path.exists(KEYWORDS_FILE):
            try:
                with open(KEYWORDS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except json.JSONDecodeError:
                print("Error: Could not parse keywords.json. Resetting file.")
                return []
        return []
    
    def load_keywords_names(self):
        if os.path.exists(KEYWORDS_FILE):
            try:
                with open(KEYWORDS_FILE, "r", encoding="utf-8") as f:
                    json_data =  json.load(f)
                    return [item['name'] for item in json_data]
            except json.JSONDecodeError:
                print("Error: Could not parse keywords.json. Resetting file.")
                return []
        return []

    def get_keywords(self):
        return self.keywords
    
    def get_keywords_names(self):
        return self.keywordsNames
    
    def get_servers(self):
        return self.servers

    def add_keyword(self, keyword):
        if any(k['name'] == keyword for k in self.keywords):
            return {"error": "Keyword already exists."}

        self.keywords.append({'name': keyword, "ids": []})
        self.save_keywords(self.keywords)
        return {"success": True}

    def remove_keyword(self, keyword):
        self.keywords = [k for k in self.keywords if k['name'] != keyword]
        self.save_keywords(self.keywords)
        return {"success": True}
    
    def delete_server(self, server_index):
        if 0 <= server_index < len(self.servers):
            deleted_server = self.servers.pop(server_index)
            with open(SERVERS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.servers, f, indent=4)

            print(f"Server '{deleted_server['name']}' deleted successfully.")
            return {"success": True, "message": f"Server '{deleted_server['name']}' deleted successfully."}
        
        return {"error": "Invalid server index."}

    def update_keyword_ids(self, keyword, ids):
        for k in self.keywords:
            if k['name'] == keyword:
                k["ids"] = ids
                self.save_keywords(self.keywords)
                return {"success": True}
        return {"error": "Keyword not found."}
    
    def save_changes(self):
            self.config['sniping'] = {
                'glitchsniping': str(glitchsniping),
                'dreamsniping': str(dreamsniping),
                'jestersniping': str(jestersniping),
                'voidcoinsniping': str(voidcoinsniping),
                'toast_notifications': str(toast_notifications),
                'token': token
            }
            self.config['Hotkeys'] = {
                'open_roblox': open_roblox_key,
                'open_roblox_toggle': str(open_roblox_toggle),
                'stop_sniper': stop_sniper_key,
                'stop_sniper_toggle': str(stop_sniper_toggle)
            }
            with open('sniper_config.ini', 'w') as configfile:
                self.config.write(configfile)

    def start_sniping(self):
        self.save_changes()
        self.clear_all_unedited_keywords_data()
        self.close_window()

    def get_window_position(self):
        window = webview.windows[0]
        if window:
            return {'x': int(window.x), 'y': int(window.y)}
        else:
            return {'x': 0, 'y': 0}

    def move_window(self, x, y):
        window = webview.windows[0]
        if window:
            try:
                window.move(int(x), int(y))
            except ValueError:
                print(f"Invalid coordinates: x={x}, y={y}")

    def minimize_window(self):
        window = webview.windows[0]
        if window:
            window.minimize()

    def close_window(self):
        window = webview.windows[0]
        if window:
            window.destroy()

api = API()

webview.create_window(
    'Sniper V2',
    'ui/index.html',

    js_api=api,
    resizable=False,
    width=1200,
    height=715,
    frameless=True
)

webview.start()

keywordslists = api.load_keywords()
servers = api.load_servers()


def convert_settings():
    global glitchsniping, dreamsniping, jestersniping, voidcoinsniping
    
    toggle_map = {
        "Glitch": glitchsniping,
        "jester": jestersniping,
        "Void coin": voidcoinsniping, # only for main sols rng server
        "Dreamspace": dreamsniping
    }
    
    for server in servers:
        if int(server['id']) == 1186570213077041233:
            for fullkeyword in server['fullkeywords']:
                name = str(fullkeyword['name'])
                if name in toggle_map:
                    fullkeyword['toggleState'] = toggle_map[name]
                
                
class CustomBot(commands.Bot):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

bot = CustomBot(command_prefix="!", help_command=None, self_bot=True, status=selfcord.Status.offline)

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user} (ID: {bot.user.id})')
    print('---------------------------------------------')
    print("All Credits go to @dannw and @yeswe join our server at https://discord.gg/4YwwA72F8q or discord.gg/solsniper")
    print("")
    print("")


def start_timer():
    global timer_running
    total_sleep_time = 120
    check_interval = 1
    elapsed_time = 0

    newToast.audio = ToastAudio(AudioSource.Reminder)
    newToast.text_fields = ['Timer started']
    toaster.show_toast(newToast)

    while timer_running and elapsed_time < total_sleep_time:
        newToast.audio = ToastAudio(AudioSource.Reminder)
        newToast.text_fields = ['SLEEPING']
        toaster.show_toast(newToast)

        for _ in range(total_sleep_time):
            if not timer_running:
                break
            time.sleep(check_interval)
            elapsed_time += check_interval

    if elapsed_time >= total_sleep_time:
        newToast.audio = ToastAudio(AudioSource.Reminder)
        newToast.text_fields = ['Timer finished']
        toaster.show_toast(newToast)

    timer_running = False

def on_press(key):
    global timer_running, timer_thread 
    global open_roblox_toggle,stop_sniper_toggle,open_roblox_key,stop_sniper_key

    try:
        if key.char == open_roblox_key.lower() and open_roblox_toggle:
            os.startfile("roblox://placeID=15532962292")
        if key.char == stop_sniper_key.lower() and stop_sniper_toggle:
            if timer_running:
                timer_running = False
                if timer_thread and timer_thread.is_alive():
                    newToast.audio = ToastAudio(AudioSource.Reminder)
                    newToast.text_fields = ['Timer stopped']
                    toaster.show_toast(newToast)
                    timer_thread = None
            else:
                timer_running = True
                timer_thread = threading.Thread(target=start_timer)
                timer_thread.start()

    except AttributeError:
        pass



def convert_roblox_link(url):
    match_game = re.match(game_pattern, url)
    if match_game:
        place_id = match_game.group(1)
        link_code = match_game.group(2)
        if place_id != "15532962292":
            return None
        link_code = ''.join(filter(str.isdigit, link_code))
        return f"roblox://placeID={place_id}&linkCode={link_code}"
    
    match_share = re.match(share_pattern, url)
    if match_share:
        code = match_share.group(1)
        share_type = match_share.group(2)
        if "Server" in share_type:
            share_type = "Server"
        elif "ExperienceInvite" in share_type:
            share_type = "ExperienceInvite"
        return f"roblox://navigation/share_links?code={code}&type={share_type}"
    return None

def openLink(input_string):
    match = url_pattern.search(input_string)
    if match:
        link = convert_roblox_link(match.group(0))
        if link:
            os.startfile(link)
        else:
            print("No valid Roblox deep link found or The provided link is not for Sols RNG.")
    else:
        print("No valid URL found in the input string.")



def isDisallowed(disallowedlist, m):
    for keywordsListName in disallowedlist:
        for keywordlist in keywordslists: 
            if str(keywordsListName) == str(keywordlist['name']):
                if any(word in m for word in keywordlist["ids"]):
                    return True
    return False
 

def isAllowed(allowedlist,m):

    for keywordsListName in allowedlist:
        for keywordlist in keywordslists: 
            if str(keywordsListName) == str(keywordlist['name']):
                if any(word in m for word in keywordlist["ids"]): 
                    return True
    return False



@bot.event
async def on_message(m):
    global timer_running, toast_notifications

    if isinstance(m.channel, selfcord.DMChannel) or isinstance(m.channel, selfcord.GroupChannel):
        guild_id = None
    else:
        guild_id = m.guild.id if m.guild else None
    if timer_running:
        return
    for server in servers:
        if str(server['id']) == str(guild_id):
            category_id = m.channel.category_id
            channel_id = m.channel.id
            if (str(channel_id) in str(server['channelIds'])) or (str(category_id) in str(server['categories'])):
                message_content = str(m.content)
                if "roblox.com" in message_content.lower():
                        if(m.author.id not in blockedUsers):
                            for trigger in server['triggers']:
                                triggerName = trigger['name']
                                triggers = trigger['ids']
                                if any(word in message_content.lower() for word in triggers):
                                    openLink(message_content)
                                    print(f"{triggerName} detected! from server: {server['name']}")
                                    print(f"Message Content: {message_content}")
                                    if(toast_notifications):
                                        newToast.audio = ToastAudio(AudioSource.Reminder)
                                        newToast.text_fields = [f'{triggerName}']
                                        toaster.show_toast(newToast)
                            for fullkeyword in server['fullkeywords']:
                                if fullkeyword['toggleState'] == True:
                                    if isDisallowed(fullkeyword['disallowed'],message_content.lower()) == False:
                                        if isAllowed(fullkeyword['allowed'],message_content.lower()):
                                            openLink(message_content)
                                            print(f"{fullkeyword['name']} detected! from server: {server['name']}")
                                            print(f"Message Content: {message_content}")
                                            if(toast_notifications):
                                                newToast.audio = ToastAudio(AudioSource.Reminder)
                                                newToast.text_fields = [f'{fullkeyword['name']}']
                                                toaster.show_toast(newToast)
                        else:
                            for trigger in server['triggers']:
                                triggerName = trigger[0]
                                triggers = trigger[1]
                                if any(word in message_content.lower() for word in triggers):
                                    print("THIS IS FROM A BLOCKED USER")
                                    print(f"{triggerName} detected! from server: {server['name']}")
                                    print(f"Message Content: {message_content}")

                                for fullkeyword in server['fullkeywords']:
                                    if isDisallowed(fullkeyword['disallowed'],message_content.lower()) == False:
                                        if isAllowed(fullkeyword['allowed'],message_content.lower()):
                                            print("THIS IS FROM A BLOCKED USER")
                                            print(f"{fullkeyword['name']} detected! from server: {server['name']}")
                                            print(f"Message Content: {message_content}")


with keyboard.Listener(on_press=on_press) as listener:
    bot.run(token)
    listener.join()
