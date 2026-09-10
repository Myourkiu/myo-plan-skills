# Qualidade de teste — anti-falso-positivo

Um teste verde só vale se ele **ficaria vermelho** caso o comportamento quebrasse. Coverage mede execução, não verificação.

## Red válido × inválido

| Falha observada no Red | Válido? |
|---|---|
| `Unable to find role="cell" with name "Loja Azul"` | ✅ falta o comportamento |
| `expected "…abc123" to contain "Loja Azul"` | ✅ |
| `Cannot find module './FeedbackRow'` | ❌ setup — corrija o import e rode de novo |
| `ReferenceError: screen is not defined` | ❌ typo |
| passou de primeira | ❌ o teste não prova nada, ou o comportamento já existia (investigue antes de seguir) |

## Anti-padrões (não escreva)

| Anti-padrão | Por que engana | Faça assim |
|---|---|---|
| Tautologia: esperado copiado do output do código | congela o bug como "correto" | esperado vem do card/spec |
| Testar o mock: mocka a API para devolver X e verifica que a tela mostra X, sem passar pela lógica | só prova que o mock funciona | mocke a fronteira e verifique a **transformação** (truncar, formatar, filtrar) |
| Asserção fraca: `toBeTruthy()`, `toBeDefined()`, `length > 0` | passa com valor errado | `toHaveTextContent('Loja Azul')`, `toEqual([...])` |
| Snapshot como única asserção | qualquer mudança vira "atualize o snapshot" | asserções explícitas; snapshot no máximo como complemento |
| Detalhe de implementação: estado interno, classe CSS, nome de função chamada | quebra em refactor, passa com bug visível | consulte como o usuário vê: `getByRole` > `getByLabelText` > `getByText` > `getByTestId` |
| Mockar a unidade sob teste ou um filho que contém a lógica em teste | o teste não exercita o código novo | renderize o componente real; mocke só rede/tempo |
| `sleep`/`setTimeout` para esperar | intermitente | `await screen.findBy…` / `waitFor` |
| Depender de ordem entre testes ou de data atual | intermitente | setup isolado por teste; fixe o relógio (`vi.useFakeTimers`/`jest.useFakeTimers`) |

## Busca / filtro / debounce (padrão comum nas telas de listagem)

- Verifique o **efeito observável**: o parâmetro que vai na request (ex.: `search=chuveiro`) ou as linhas filtradas na tela.
- Debounce: timers falsos + `advanceTimersByTime`; asserte que **não** busca antes do tempo e **busca** depois.
- Paginação + busca: asserte que trocar o termo volta para a página 1, se esse for o comportamento do código ao redor.

## Mutação temporária (prova de que o teste morde)

Escolha 1–2 por lógica relevante, aplique via Edit no código de produção, rode, desfaça:
- inverter condição (`>` → `>=`, `includes` → `!includes`);
- trocar limite (truncar em 80 → 8);
- remover o campo novo do JSX (`{row.accountName}` → nada);
- ignorar o termo de busca (não enviar o parâmetro).

Nenhum teste ficou vermelho → adicione ou fortaleça a asserção antes de seguir. Confirme com `git diff` que a mutação foi desfeita.

## Testes de caracterização (regressão)

Para "não pode acontecer" sem cobertura (ex.: "o modal, a galeria e a mudança de status continuam iguais"):
- escreva **antes** de alterar o código;
- descrevem o comportamento atual observável (abrir o modal pela linha, galeria renderiza as imagens, trocar status chama a API certa);
- passam verdes desde o início e continuam verdes no final — é a prova da não-regressão.

## .NET (xUnit/NUnit), quando for backend C#

- Um comportamento por teste, nome no formato `Metodo_Cenario_Resultado`.
- Asserte o resultado/estado final, não chamadas internas (`Verify` de mock só em fronteira: repositório externo, gateway, clock).
- Nada de `[Fact(Skip = …)]`/`[Ignore]` para destravar a suíte.

## Checklist antes de dar um teste por pronto

- [ ] Vi falhar pelo motivo certo (ou é caracterização declarada)
- [ ] Esperado vem do card/spec, não do código
- [ ] Asserção específica sobre algo observável
- [ ] Só fronteiras mockadas
- [ ] Uma mutação relevante o deixa vermelho
- [ ] Nome descreve o comportamento ("mostra o nome do vendedor na linha"), não a implementação
