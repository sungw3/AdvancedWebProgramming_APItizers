__MOOD_LIST = [None,"Happy","Sad","Angry"]
#전체 코드에서 사용하는 감정 리스트 정의
def get()->list:
    return list(__MOOD_LIST)

if __name__ == '__main__':
    print(get())