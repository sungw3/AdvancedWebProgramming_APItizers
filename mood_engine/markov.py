import mlist


class GlobalMarcov:
    #전역 마르코프 체인
    __slots__ = ['base']
    
    mood_list = mlist.get()
    n = len(mood_list)
    conv_dt = {v:i for i,v in enumerate(mood_list)}
    
    def __init__(self):
        n = GlobalMarcov.n
        self.base = [[[[[0 for _ in range(n)] 
            for _ in range(n)] 
           for _ in range(n)] 
          for _ in range(n)] 
         for _ in range(n)]
        
    
    def conv(self,moods:list)->list:
        #문자열 감정 리스트를 인덱스로 바꿔주는 메서드
        return [GlobalMarcov.conv_dt[i] for i in moods]
        
    def update(self,prev_mood:list[str],nxt_mood:str):
        prev_mood = self.conv(prev_mood)
        nxt_mood = GlobalMarcov.conv_dt[nxt_mood]
        
        #정규화
        a = ([0]*4 + prev_mood)[-4:] + [nxt_mood]
        
        self.base[a[0]][a[1]][a[2]][a[3]][a[4]]+=1
        self.base[0][a[1]][a[2]][a[3]][a[4]]+=1
        self.base[0][0][a[2]][a[3]][a[4]]+=1
        self.base[0][0][0][a[3]][a[4]]+=1


    def get(self,prev_mood:list[str])->list:
        prev_mood = self.conv(prev_mood)
        
        a = ([0]*4 + prev_mood)[-4:]
        return [
            self.base[a[0]][a[1]][a[2]][a[3]],
            self.base[0][a[1]][a[2]][a[3]],
            self.base[0][0][a[2]][a[3]],
            self.base[0][0][0][a[3]]
            ]
    

class UserMarcov:
    __slots__ = ['base']
    
    mood_list = mlist.get()
    n = len(mood_list)
    conv_dt = {v:i for i,v in enumerate(mood_list)}
    
    
    def __init__(self):
        n = UserMarcov.n
        self.base = [[[0 for _ in range(n)] 
                      for _ in range(n)] 
                     for _ in range(n)]
    
    
    def conv(self,moods:list)->list:
        #문자열 감정 리스트를 인덱스로 바꿔주는 메서드
        return [UserMarcov.conv_dt[i] for i in moods]
    
    
    def update(self,prev_mood:list[str],nxt_mood:str):
        prev_mood = self.conv(prev_mood)
        nxt_mood = UserMarcov.conv_dt[nxt_mood]
        
        #정규화
        a = ([0]*2 + prev_mood)[-2:] + [nxt_mood]
        
        self.base[a[0]][a[1]][a[2]]+=1
        self.base[0][a[1]][a[2]]+=1
        self.base[0][0][a[2]]+=1

    def get(self,prev_mood:list[str])->list:
        prev_mood = self.conv(prev_mood)
        
        a = ([0]*2 + prev_mood)[-2:]
        return [
            self.base[a[0]][a[1]],
            self.base[0][a[1]],
            ]


