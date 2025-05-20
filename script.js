document.addEventListener("DOMContentLoaded", () => {
    const generosContainer = document.getElementById("generos");
    const addBtn = document.getElementById("add-caracteristica-btn");
    const clearBtn = document.getElementById("clear-caracteristicas-btn");
    const buscarBtn = document.getElementById("btn-BuscarJogos");
    const responseDiv = document.getElementById("response");

    const MIN_CAMPOS = 3;

    // Cria campo de característica
    function criarCampoCaracteristica() {
        const div = document.createElement("div");
        div.className = "caracteristica-row flex items-center space-x-2";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "ingredient ingredient-input flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700";
        input.placeholder = "Informe uma caracteristica";

        const excluirBtn = document.createElement("button");
        excluirBtn.className = "btn-danger bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 text-sm";
        excluirBtn.textContent = "Excluir";

        excluirBtn.addEventListener("click", () => {
            const totalCampos = document.querySelectorAll(".caracteristica-row").length;
            if (totalCampos > MIN_CAMPOS) {
                div.remove();
            } else {
                alert(`É necessário manter pelo menos ${MIN_CAMPOS} campos de características.`);
            }
        });

        div.appendChild(input);
        div.appendChild(excluirBtn);
        generosContainer.insertBefore(div, addBtn);
    }

    // Inicializa evento de exclusão nos campos já existentes
    function aplicarEventosExclusao() {
        document.querySelectorAll(".btn-danger").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const totalCampos = document.querySelectorAll(".caracteristica-row").length;
                if (totalCampos > MIN_CAMPOS) {
                    e.target.closest(".caracteristica-row").remove();
                } else {
                    alert(`É necessário manter pelo menos ${MIN_CAMPOS} campos de características.`);
                }
            });
        });
    }

    // Adiciona campo
    addBtn.addEventListener("click", () => {
        criarCampoCaracteristica();
    });

    // Limpa campos: reduz até o mínimo
    clearBtn.addEventListener("click", () => {
        const campos = document.querySelectorAll(".caracteristica-row");
        campos.forEach((campo, index) => {
            if (index >= MIN_CAMPOS) {
                campo.remove();
            } else {
                campo.querySelector("input").value = ""; // Limpa os 3 primeiros
            }
        });
    });

    // Buscar jogos
    buscarBtn.addEventListener("click", async () => {
        const caracteristicas = [];
        document.querySelectorAll(".ingredient-input").forEach(input => {
            if (input.value.trim()) {
                caracteristicas.push(input.value.trim());
            }
        });

        const precoInput = document.querySelector(".preco-input");
        const preco = precoInput.value.trim();

        if (caracteristicas.length < MIN_CAMPOS) {
            alert(`Por favor, preencha pelo menos ${MIN_CAMPOS} características para buscar.`);
            return;
        }

        const dados = {
            caracteristicas: caracteristicas,
            preco: preco
        };
        console.log("Dados enviados para o servidor:", dados);
        try {
            console.log("Buscando jogos...");
            const response = await fetch("http://localhost:5000/caracteristica", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });
            console.log("Resposta do servidor:", response);
            const resultado = await response.json();
            console.log("Resultado recebido:", resultado);

            // Sempre mostra a div de resposta (ou erro ou sucesso)
            responseDiv.classList.remove("hidden"); 

            if (resultado.status === "success") {
                console.log("Jogos encontrados:", resultado.jogos);
                
                if (!Array.isArray(resultado.jogos)) {
                    console.error("Formato inesperado da resposta: resultado.jogos não é um array.");
                    responseDiv.innerHTML = `<p class="text-red-500">Erro: Formato de dados inesperado do servidor.</p>`;
                    return; 
                }

                const jogosHTML = resultado.jogos.map(jogo => {
                    // Trata as características: garantindo que é um array ou uma string
                    const caracteristicasFormatadas = Array.isArray(jogo.caracteristicas) 
                                                      ? jogo.caracteristicas.join(", ")
                                                      : (typeof jogo.caracteristicas === 'string' 
                                                         ? jogo.caracteristicas 
                                                         : 'N/A');
                    
                    // Define o título: Usa jogo.titulo se existir, senão usa o primeiro elemento de caracteristicas, senão "Nome do Jogo"
                    const nomeDoJogo = jogo.titulo || (Array.isArray(jogo.caracteristicas) && jogo.caracteristicas.length > 0 
                                                      ? jogo.caracteristicas[0] 
                                                      : "Nome do Jogo Desconhecido");

                    return `
                        <div class="jogo-item border p-4 mb-4 rounded shadow">
                            <h3 class="text-lg font-semibold">${nomeDoJogo}</h3>
                            <p><strong>Plataforma:</strong> ${jogo.plataforma || 'N/A'}</p>
                            <p><strong>Tempo de Jogo:</strong> ${jogo.tempo_de_jogo || 'N/A'}</p>
                            <p><strong>Preço:</strong> R$ ${jogo.preco || 'N/A'}</p>
                            <p><strong>Características:</strong> ${caracteristicasFormatadas}</p>
                            <p><strong>Link:</strong> <a href="${jogo.link}" target="_blank" class="text-blue-600 hover:underline">${jogo.link || 'N/A'}</a></p>
                        </div>
                    `;
                }).join("");
                
                responseDiv.innerHTML = `
                    <h2 class="text-2xl font-semibold mb-4 text-gray-800">Jogos encontrados</h2>
                    ${jogosHTML}
                `;
                
            } else {
                console.error("Erro ao buscar jogos:", resultado.message);
                responseDiv.innerHTML = `<p class="text-red-500">Erro: ${resultado.message}</p>`;
            }
        }
        catch (error) {
            console.error("Erro ao buscar jogos:", error);
            responseDiv.innerHTML = `<p class="text-red-500">Erro: ${error.message}</p>`;
            responseDiv.classList.remove("hidden");
        }
    });

    function garantirMinimoCamposIniciais() {
        const camposAtuais = document.querySelectorAll(".caracteristica-row").length;
        if (camposAtuais < MIN_CAMPOS) {
            for (let i = camposAtuais; i < MIN_CAMPOS; i++) {
                criarCampoCaracteristica();
            }
        }
    }

    aplicarEventosExclusao();
    garantirMinimoCamposIniciais();
});