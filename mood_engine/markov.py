
#구현 복잡도를 낮추기 위해 해당 파일의 클래스들은 모두 정수 인덱스만을 처리합니다

mood = 10

class GlobalMarcov:
    #전역 마르코프 체인
    
    __slots__ = ['n','base']
    
    def __init__(self):
        self.n = mood
        self.base = [[[[[0 for _ in range(self.n)] 
            for _ in range(self.n)] 
           for _ in range(self.n)] 
          for _ in range(self.n)] 
         for _ in range(self.n)]
        
    def update(self,prev_mood:list[int],nxt_mood:int):
        #반드시 감정을 정수로 변환한 리스트를 사용할 것
        
        #정규화
        a = ([0]*4 + prev_mood)[-4:] + [nxt_mood]
        
        self.base[a[0]][a[1]][a[2]][a[3]][a[4]]+=1
        self.base[0][a[1]][a[2]][a[3]][a[4]]+=1
        self.base[0][0][a[2]][a[3]][a[4]]+=1
        self.base[0][0][0][a[3]][a[4]]+=1


    def get(self,prev_mood:list[int])->list:
        a = ([0]*4 + prev_mood)[-4:]
        return [
            self.base[a[0]][a[1]][a[2]][a[3]],
            self.base[0][a[1]][a[2]][a[3]],
            self.base[0][0][a[2]][a[3]],
            self.base[0][0][0][a[3]]
            ]
    

class UserMarcov:
    
    __slots__ = ['n','base']
    
    def __init__(self):
        self.n = mood
        self.base = [[[0 for _ in range(self.n)] for _ in range(self.n)] for _ in range(self.n)]
        
    def update(self,prev_mood:list[int],nxt_mood:int):
        #반드시 감정을 정수로 변환한 리스트를 사용할 것
        
        #정규화
        a = ([0]*2 + prev_mood)[-2:] + [nxt_mood]
        
        self.base[a[0]][a[1]][a[2]]+=1
        self.base[0][a[1]][a[2]]+=1
        self.base[0][0][a[2]]+=1

    def get(self,prev_mood:list[int])->list:
        a = ([0]*2 + prev_mood)[-2:]
        return [
            self.base[a[0]][a[1]],
            self.base[0][a[1]],
            ]


