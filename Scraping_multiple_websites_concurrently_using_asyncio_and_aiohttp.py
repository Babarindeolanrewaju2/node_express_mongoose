import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    urls = ["http://example.com", "http://example2.com", "http://example3.com"]
    tasks = []
    async with aiohttp.ClientSession() as session:
        for url in urls:
            task = asyncio.create_task(fetch(session, url))
            tasks.append(task)
        responses = await asyncio.gather(*tasks)
        for response in responses:
            print(response)

asyncio.run(main())
