import pygame
import random

# 초기화
pygame.init()

# 색상 정의
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GRAY = (128, 128, 128)
CYAN = (0, 255, 255)
YELLOW = (255, 255, 0)
PURPLE = (128, 0, 128)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
ORANGE = (255, 165, 0)

# 게임 설정
BLOCK_SIZE = 30
GRID_WIDTH = 10
GRID_HEIGHT = 20
SCREEN_WIDTH = GRID_WIDTH * BLOCK_SIZE + 200
SCREEN_HEIGHT = GRID_HEIGHT * BLOCK_SIZE
FPS = 60

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

COLORS = [CYAN, YELLOW, PURPLE, GREEN, RED, BLUE, ORANGE]


class Tetromino:
    def __init__(self):
        self.shape_index = random.randint(0, len(SHAPES) - 1)
        self.shape = SHAPES[self.shape_index]
        self.color = COLORS[self.shape_index]
        self.x = GRID_WIDTH // 2 - len(self.shape[0]) // 2
        self.y = 0

    def rotate(self):
        """블록 회전"""
        self.shape = [[self.shape[j][i] for j in range(len(self.shape) - 1, -1, -1)]
                      for i in range(len(self.shape[0]))]


class Tetris:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Tetris")
        self.clock = pygame.time.Clock()
        self.grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.current_piece = Tetromino()
        self.game_over = False
        self.score = 0
        self.fall_time = 0
        self.fall_speed = 500  # milliseconds

    def check_collision(self, piece, x, y):
        """충돌 체크"""
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
        """현재 블록을 그리드에 병합"""
        for i, row in enumerate(self.current_piece.shape):
            for j, cell in enumerate(row):
                if cell:
                    self.grid[self.current_piece.y + i][self.current_piece.x + j] = self.current_piece.color
        self.clear_lines()
        self.current_piece = Tetromino()
        if self.check_collision(self.current_piece, self.current_piece.x, self.current_piece.y):
            self.game_over = True

    def clear_lines(self):
        """완성된 줄 제거"""
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
        """블록 이동"""
        new_x = self.current_piece.x + dx
        new_y = self.current_piece.y + dy
        if not self.check_collision(self.current_piece, new_x, new_y):
            self.current_piece.x = new_x
            self.current_piece.y = new_y
            return True
        return False

    def rotate(self):
        """블록 회전"""
        original_shape = self.current_piece.shape
        self.current_piece.rotate()
        if self.check_collision(self.current_piece, self.current_piece.x, self.current_piece.y):
            self.current_piece.shape = original_shape

    def hard_drop(self):
        """블록을 바닥까지 즉시 떨어뜨림"""
        while self.move(0, 1):
            pass
        self.merge_piece()

    def draw(self):
        """화면 그리기"""
        self.screen.fill(BLACK)

        # 그리드 그리기
        for y in range(GRID_HEIGHT):
            for x in range(GRID_WIDTH):
                pygame.draw.rect(self.screen, GRAY,
                               (x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE), 1)
                if self.grid[y][x]:
                    pygame.draw.rect(self.screen, self.grid[y][x],
                                   (x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1,
                                    BLOCK_SIZE - 2, BLOCK_SIZE - 2))

        # 현재 블록 그리기
        for i, row in enumerate(self.current_piece.shape):
            for j, cell in enumerate(row):
                if cell:
                    x = (self.current_piece.x + j) * BLOCK_SIZE
                    y = (self.current_piece.y + i) * BLOCK_SIZE
                    pygame.draw.rect(self.screen, self.current_piece.color,
                                   (x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2))

        # 점수 표시
        font = pygame.font.Font(None, 36)
        score_text = font.render(f'Score: {self.score}', True, WHITE)
        self.screen.blit(score_text, (GRID_WIDTH * BLOCK_SIZE + 20, 50))

        # 조작법 표시
        font_small = pygame.font.Font(None, 24)
        controls = [
            "Controls:",
            "← → : Move",
            "↑ : Rotate",
            "↓ : Soft Drop",
            "Space : Hard Drop"
        ]
        for i, text in enumerate(controls):
            control_text = font_small.render(text, True, WHITE)
            self.screen.blit(control_text, (GRID_WIDTH * BLOCK_SIZE + 20, 150 + i * 30))

        # 게임 오버 표시
        if self.game_over:
            overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
            overlay.set_alpha(128)
            overlay.fill(BLACK)
            self.screen.blit(overlay, (0, 0))

            font_large = pygame.font.Font(None, 72)
            game_over_text = font_large.render('GAME OVER', True, RED)
            text_rect = game_over_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 50))
            self.screen.blit(game_over_text, text_rect)

            restart_text = font.render('Press R to Restart', True, WHITE)
            restart_rect = restart_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 50))
            self.screen.blit(restart_text, restart_rect)

        pygame.display.flip()

    def run(self):
        """게임 실행"""
        running = True

        while running:
            delta_time = self.clock.get_rawtime()
            self.fall_time += delta_time

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False

                if event.type == pygame.KEYDOWN:
                    if self.game_over:
                        if event.key == pygame.K_r:
                            self.__init__()
                    else:
                        if event.key == pygame.K_LEFT:
                            self.move(-1, 0)
                        elif event.key == pygame.K_RIGHT:
                            self.move(1, 0)
                        elif event.key == pygame.K_DOWN:
                            self.move(0, 1)
                        elif event.key == pygame.K_UP:
                            self.rotate()
                        elif event.key == pygame.K_SPACE:
                            self.hard_drop()

            # 자동 낙하
            if not self.game_over and self.fall_time >= self.fall_speed:
                if not self.move(0, 1):
                    self.merge_piece()
                self.fall_time = 0

            self.draw()
            self.clock.tick(FPS)

        pygame.quit()


if __name__ == "__main__":
    game = Tetris()
    game.run()
