import random
import time
import sys
import tty
import termios
import threading

# 테트로미노 모양 정의
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[0, 1, 0], [1, 1, 1]],  # T
    [[0, 1, 1], [1, 1, 0]],  # S
    [[1, 1, 0], [0, 1, 1]],  # Z
    [[1, 0, 0], [1, 1, 1]],  # J
    [[0, 0, 1], [1, 1, 1]]   # L
]

GRID_WIDTH = 10
GRID_HEIGHT = 20


class Tetromino:
    def __init__(self):
        self.shape_index = random.randint(0, len(SHAPES) - 1)
        self.shape = [row[:] for row in SHAPES[self.shape_index]]
        self.x = GRID_WIDTH // 2 - len(self.shape[0]) // 2
        self.y = 0

    def rotate(self):
        self.shape = [[self.shape[j][i] for j in range(len(self.shape) - 1, -1, -1)]
                      for i in range(len(self.shape[0]))]


class TetrisConsole:
    def __init__(self):
        self.grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.current_piece = Tetromino()
        self.game_over = False
        self.score = 0
        self.last_key = None
        self.running = True

    def check_collision(self, piece, x, y):
        for i, row in enumerate(piece.shape):
            for j, cell in enumerate(row):
                if cell:
                    new_x = x + j
                    new_y = y + i
                    if (new_x < 0 or new_x >= GRID_WIDTH or
                        new_y >= GRID_HEIGHT or
                        (new_y >= 0 and self.grid[new_y][new_x])):
                        return True
        return False

    def merge_piece(self):
        for i, row in enumerate(self.current_piece.shape):
            for j, cell in enumerate(row):
                if cell:
                    self.grid[self.current_piece.y + i][self.current_piece.x + j] = 1
        self.clear_lines()
        self.current_piece = Tetromino()
        if self.check_collision(self.current_piece, self.current_piece.x, self.current_piece.y):
            self.game_over = True

    def clear_lines(self):
        lines_cleared = 0
        y = GRID_HEIGHT - 1
        while y >= 0:
            if all(self.grid[y]):
                del self.grid[y]
                self.grid.insert(0, [0 for _ in range(GRID_WIDTH)])
                lines_cleared += 1
            else:
                y -= 1
        if lines_cleared > 0:
            self.score += lines_cleared * 100

    def move(self, dx, dy):
        new_x = self.current_piece.x + dx
        new_y = self.current_piece.y + dy
        if not self.check_collision(self.current_piece, new_x, new_y):
            self.current_piece.x = new_x
            self.current_piece.y = new_y
            return True
        return False

    def rotate(self):
        original_shape = [row[:] for row in self.current_piece.shape]
        self.current_piece.rotate()
        if self.check_collision(self.current_piece, self.current_piece.x, self.current_piece.y):
            self.current_piece.shape = original_shape

    def hard_drop(self):
        while self.move(0, 1):
            pass
        self.merge_piece()

    def draw(self):
        # 화면 지우기
        print('\033[2J\033[H', end='')

        # 그리드 복사
        display = [row[:] for row in self.grid]

        # 현재 블록 추가
        for i, row in enumerate(self.current_piece.shape):
            for j, cell in enumerate(row):
                if cell and self.current_piece.y + i >= 0:
                    display[self.current_piece.y + i][self.current_piece.x + j] = 2

        # 출력
        print('=' * (GRID_WIDTH * 2 + 2))
        for row in display:
            print('|' + ''.join('██' if cell == 1 else '[]' if cell == 2 else '  ' for cell in row) + '|')
        print('=' * (GRID_WIDTH * 2 + 2))
        print(f'Score: {self.score}')
        print('Controls: a=left, d=right, w=rotate, s=down, space=drop, q=quit')

        if self.game_over:
            print('\n*** GAME OVER ***')

    def get_key(self):
        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setraw(sys.stdin.fileno())
            ch = sys.stdin.read(1)
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
        return ch

    def input_thread(self):
        while self.running:
            try:
                key = self.get_key()
                self.last_key = key
                if key == 'q':
                    self.running = False
            except:
                break

    def run(self):
        # 입력 스레드 시작
        thread = threading.Thread(target=self.input_thread, daemon=True)
        thread.start()

        fall_counter = 0
        fall_interval = 10  # 낮을수록 빠름

        try:
            while self.running and not self.game_over:
                # 키 입력 처리
                if self.last_key:
                    key = self.last_key
                    self.last_key = None

                    if key == 'a':
                        self.move(-1, 0)
                    elif key == 'd':
                        self.move(1, 0)
                    elif key == 's':
                        self.move(0, 1)
                    elif key == 'w':
                        self.rotate()
                    elif key == ' ':
                        self.hard_drop()

                # 자동 낙하
                fall_counter += 1
                if fall_counter >= fall_interval:
                    if not self.move(0, 1):
                        self.merge_piece()
                    fall_counter = 0

                self.draw()
                time.sleep(0.1)

            if self.game_over:
                self.draw()
                print("\nPress any key to exit...")
                self.get_key()

        finally:
            self.running = False


if __name__ == "__main__":
    print("Starting Tetris Console...")
    time.sleep(1)
    game = TetrisConsole()
    game.run()
