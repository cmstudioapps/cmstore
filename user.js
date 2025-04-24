const i = localStorage.getItem("idUser") || "Não definido"

alert(i)
navigator.clipboard.writeText(i)