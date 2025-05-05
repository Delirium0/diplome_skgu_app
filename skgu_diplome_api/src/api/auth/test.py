import asyncio
import httpx
import time

# --- НАСТРОЙКИ ---
# Укажите URL вашего запущенного FastAPI приложения
API_URL = "http://127.0.0.1:8000/auth/login"  # Замените, если нужно (порт, хост)

# Учетные данные для теста (используйте ваши тестовые)
TEST_LOGIN = "vt1042"  # ЗАМЕНИТЕ
TEST_PASSWORD = "p3y1u3rs"  # ЗАМЕНИТЕ

NUM_REQUESTS = 4  # Количество одновременных запросов


# -----------------

async def send_login_request(client: httpx.AsyncClient, request_id: int):
    """Отправляет один запрос на логин и выводит время."""
    payload = {"login": TEST_LOGIN, "password": TEST_PASSWORD}
    start_time = time.time()
    print(f"[Client {request_id}] Sending request at {start_time:.4f}")
    try:
        response = await client.post(API_URL, json=payload)
        response.raise_for_status()  # Вызовет исключение для 4xx/5xx ответов
        end_time = time.time()
        print(
            f"[Client {request_id}] SUCCESS at {end_time:.4f} (Duration: {end_time - start_time:.4f}s). Status: {response.status_code}. Response: {response.json()}")
    except httpx.RequestError as exc:
        end_time = time.time()
        print(
            f"[Client {request_id}] Request FAILED at {end_time:.4f} (Duration: {end_time - start_time:.4f}s). Error: {exc}")
    except httpx.HTTPStatusError as exc:
        end_time = time.time()
        print(
            f"[Client {request_id}] HTTP Error at {end_time:.4f} (Duration: {end_time - start_time:.4f}s). Status: {exc.response.status_code}. Response: {exc.response.text}")
    except Exception as e:
        end_time = time.time()
        print(
            f"[Client {request_id}] UNEXPECTED Error at {end_time:.4f} (Duration: {end_time - start_time:.4f}s). Error: {e}")


async def main():
    """Запускает несколько запросов на логин одновременно."""
    async with httpx.AsyncClient(timeout=60.0) as client:  # Увеличим таймаут на всякий случай
        tasks = []
        print(f"Starting {NUM_REQUESTS} concurrent login requests...")
        for i in range(NUM_REQUESTS):
            task = asyncio.create_task(send_login_request(client, i + 1))
            tasks.append(task)

        # Ждем завершения всех запросов
        await asyncio.gather(*tasks)
    print("All requests finished.")


if __name__ == "__main__":

    asyncio.run(main())
