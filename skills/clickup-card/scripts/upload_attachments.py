"""Envia arquivos locais como anexos de tasks do ClickUp.

Cada arquivo precisa de um ticket pedido antes com `clickup_request_attachment_upload`
(um por arquivo, válido por poucos minutos). Uso:

    python -I upload_attachments.py jobs.json

jobs.json:
    [{"path": "C:/caminho/absoluto/SPEC.md", "name": "SPEC-entrega-1.md", "ticket": "<upload_ticket>"}]

O arquivo de jobs contém tickets de upload: apagar depois de usar.
"""
import json
import mimetypes
import sys
import urllib.error
import urllib.request
import uuid

UPLOAD_URL = "https://mcp.clickup.com/upload"


def enviar(job):
    with open(job["path"], "rb") as f:
        dados = f.read()
    tipo = mimetypes.guess_type(job["name"])[0] or "application/octet-stream"
    if job["name"].endswith(".md"):
        tipo = "text/markdown"
    fronteira = uuid.uuid4().hex
    corpo = (
        f"--{fronteira}\r\n"
        f'Content-Disposition: form-data; name="attachment"; filename="{job["name"]}"\r\n'
        f"Content-Type: {tipo}\r\n\r\n"
    ).encode() + dados + f"\r\n--{fronteira}--\r\n".encode()
    req = urllib.request.Request(UPLOAD_URL, data=corpo, method="POST", headers={
        "Content-Type": f"multipart/form-data; boundary={fronteira}",
        "X-Upload-Ticket": job["ticket"],
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return f"{job['name']}: {resp.status}"
    except urllib.error.HTTPError as erro:
        return f"{job['name']}: ERRO {erro.code} {erro.read().decode()[:300]}"


if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as f:
        for job in json.load(f):
            print(enviar(job))
