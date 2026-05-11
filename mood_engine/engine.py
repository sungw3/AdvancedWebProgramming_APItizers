import markov,mlist
from prompt_manager import PromptManager
from store import DatabaseManager
import time


# 서버 user_id, room_id, message -> mood


class Engine:

    def __init__(self):
        self.DBM = DatabaseManager()
        self.PM = PromptManager()
        
        self.global_marcov = self.DBM.load_global()
        
        self.user_marcov = {}
    
    
    
    def query(self,user_id,room_id,message:str)->str:
        pass
