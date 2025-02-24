function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Erro ao tentar entrar em tela cheia: ${err.message}`);
        });
    }
        
    
}