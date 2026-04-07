# 3-bypass-cloudflare-turnstile-with-Kameleo

Install Kameleo and Playwright
```commandline
pip install playwright
pip install kameleo.local_api_client==3.4.0
```

Start Kameleo
```commandline
cd C:\Users\<YOUR_USERNAME>\AppData\Local\Programs\Kameleo
Kameleo.CLI.exe email=<YOUR_EMAIL> password=<YOUR_PASSWORD>
```

Run code
```commandline
python kameleo_cloudflare_turnstile.py
```