// Cena de Boas-Vindas
class WelcomeScene extends Phaser.Scene {
    constructor() {
        // Chamando o construtor da classe Phaser.Scene e definindo chave da cena como 'WelcomeScene'
        super({ key: 'WelcomeScene' }); 
    }

    preload() {
        // Carregando a imagem de fundo da tela de boas-vindas
        this.load.image('background', 'assets/sky.png'); 
    }

    create() {
        // Adicionando a imagem de fundo na tela
        this.add.image(500, 400, 'background');

        // Adicionando o título do jogo
        this.add.text(400, 150, 'JETFight', { fontSize: '50px', fill: '#000', fontFamily: 'Revamped' }).setOrigin(0.5, 0.5);
        // Adicionando instrução para iniciar o jogo
        this.add.text(400, 250, 'Pressione SPACE para começar', { fontSize: '20px', fill: '#fff', fontFamily: 'revamped' }).setOrigin(0.5, 0.5);

        // Adicionando os controles do jogo na tela inicial
        this.add.text(400, 350, 'Controles:', { fontSize: '25px', fill: 'black', fontFamily: 'revamped' }).setOrigin(0.5, 0.5);
        this.add.text(400, 380, '←  Mover para a Esquerda', { fontSize: '20px', fill: 'black', fontFamily: 'revamped' }).setOrigin(0.5, 0.5);
        this.add.text(400, 410, '→  Mover para a Direita', { fontSize: '20px', fill: 'black', fontFamily: 'revamped' }).setOrigin(0.5, 0.5);
        this.add.text(400, 440, '↑  Acelerar (ativa a chama)', { fontSize: '20px', fill: 'black', fontFamily: 'revamped' }).setOrigin(0.5, 0.5);

        // Adicionando evento de teclado para iniciar o jogo ao pressionar SPACE
        this.input.keyboard.on('keydown-SPACE', () => this.scene.start('GameScene'));
    }
}

// Cena do Jogo
class GameScene extends Phaser.Scene {
    constructor() {
        // Chamando o construtor da classe Phaser.Scene e definindo chave da cena como 'GameScene'
        super({ key: 'GameScene' }); 
    }

    preload() {
        // Carregando as imagens necessárias para a cena do jogo
        this.load.image('sky', 'assets/sky.png'); 
        this.load.image('missile', 'assets/missile.png'); 
        this.load.image('jet', 'assets/jet.png'); 
        this.load.image('explosion', 'assets/explosion.png'); 
        this.load.image('flame', 'assets/flame.png'); 
        this.load.image('cloud', 'assets/cloud.png'); 
    }

    create() {
        // Adicionando a imagem de fundo do jogo
        this.add.image(500, 400, 'sky');

        // Criando o jato como um sprite físico
        this.jet = this.physics.add.sprite(400, 300, 'jet').setScale(0.3); 
        // Habilitando colisão com as bordas do mundo
        this.jet.setCollideWorldBounds(true); 
        // Ajustando o tamanho do corpo do jato para melhor colisão
        this.jet.setBodySize(this.jet.width * 0.5, this.jet.height * 0.7); 

        // Definindo o deslocamento da chama em relação ao jato
        this.flameOffsetX = 0;
        this.flameOffsetY = 110;

        // Criando a chama do jato
        this.flame = this.add.image(this.jet.x + this.flameOffsetX, this.jet.y + this.flameOffsetY, 'flame')
            .setScale(0.15)
            .setVisible(false); // Inicialmente invisível

        // Criando um grupo de mísseis
        this.missiles = this.physics.add.group(); 
        // Criando a explosão (inicialmente invisível)
        this.explosion = this.add.image(0, 0, 'explosion').setScale(0.7).setVisible(false); 

        // Criando nuvens estáticas nas laterais da tela
        this.cloudLeft = this.physics.add.staticImage(100, 550, 'cloud').setScale(0.5); 
        this.cloudRight = this.physics.add.staticImage(700, 550, 'cloud').setScale(0.5); 

        // Ajustando o tamanho e o deslocamento das nuvens para melhor colisão
        this.cloudLeft.setSize(this.cloudLeft.width * 0.25, this.cloudLeft.height * 0.25).setOffset(this.cloudLeft.width * 0.375, this.cloudLeft.height * 0.375); 
        this.cloudRight.setSize(this.cloudRight.width * 0.25, this.cloudRight.height * 0.25).setOffset(this.cloudRight.width * 0.375, this.cloudRight.height * 0.375); 

        // Adicionando colisão entre o jato e as nuvens
        this.physics.add.collider(this.jet, this.cloudLeft, this.hitCloud, null, this); 
        this.physics.add.collider(this.jet, this.cloudRight, this.hitCloud, null, this); 

        // Habilitando controles de teclado
        this.cursors = this.input.keyboard.createCursorKeys(); 

        // Criando um temporizador para gerar mísseis
        this.missileTimer = this.time.addEvent({
            delay: 1000, // Intervalo de 1 segundo
            callback: this.spawnMissile, // Função para gerar mísseis
            callbackScope: this,
            loop: true // Repetir indefinidamente
        });

        // Adicionando sobreposição entre o jato e os mísseis
        this.physics.add.overlap(this.jet, this.missiles, this.hitMissile, null, this); 

        // Criando lista de mísseis desviados (UTILIZANDO LISTA [REQUISITO])
        this.missilesDodgedList = []; 
        // Adicionando texto para exibir a quantidade de mísseis desviados
        this.missilesText = this.add.text(750, 20, 'Desviados: 0', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'revamped'
        }).setOrigin(1, 0); 

        // Variável para controlar o estado do jogo
        this.gameOver = false; 
    }

    update() {
        // Se o jogo acabou, não atualiza mais
        if (this.gameOver) return; 

        // Movendo o jato para a esquerda
        if (this.cursors.left.isDown) {
            this.jet.setVelocityX(-300); 
        } 
        // Movendo o jato para a direita
        else if (this.cursors.right.isDown) {
            this.jet.setVelocityX(300); 
        } 
        // Parando o movimento horizontal
        else {
            this.jet.setVelocityX(0); 
        }

        // Movendo o jato para cima e ativando a chama
        if (this.cursors.up.isDown) {
            this.jet.setVelocityY(-5); 
            this.flame.setVisible(true); 
        } 
        // Desativando a chama
        else {
            this.flame.setVisible(false); 
        }

        // Movendo o jato para baixo
        if (this.cursors.down.isDown) {
            this.jet.setVelocityY(500); 
        } 
        // Parando o movimento vertical
        else if (!this.cursors.up.isDown) {
            this.jet.setVelocityY(0); 
        }

        // Atualizando a posição da chama em relação ao jato
        this.flame.setPosition(this.jet.x + this.flameOffsetX, this.jet.y + this.flameOffsetY); 

        // Verificando se os mísseis saíram da tela (UTILIZANDO ESTRUTURA DE REPETIÇÃO [REQUISITO])
        this.missiles.children.iterate(missile => {
            if (missile && missile.y > 600) {
                missile.destroy(); 
                // Adicionando à lista de mísseis desviados
                this.missilesDodgedList.push(1); 
                // Atualizando o texto de mísseis desviados
                this.missilesText.setText(`Desviados: ${this.missilesDodgedList.length}`); 
            }
        });
    }

    // Função para gerar mísseis (UTILIZANDO FUNÇÃO [REQUISITO])
    spawnMissile() {
        // Se o jogo acabou, não gera mais mísseis (UTILIZANDO ESTUTURA CONDICIONAL [REQUISITO])
        if (this.gameOver) return; 

        // Definindo uma posição aleatória no eixo X
        let xPosition = Phaser.Math.Between(50, 750); 
        // Criando o míssil
        let missile = this.missiles.create(xPosition, 0, 'missile'); 
        missile.setScale(0.15); 
        missile.setVelocityY(600); 
        missile.setBodySize(missile.width * 0.5, missile.height * 0.5); 
    }

    // Função para tratar colisão entre o jato e o míssil
    hitMissile(jet, missile) {
        // Ativando a explosão
        this.triggerExplosion(jet); 
        // Destruindo o míssil
        missile.destroy(); 
    }

    // Função para tratar colisão entre o jato e as nuvens
    hitCloud(jet, cloud) {
        // Ativando a explosão
        this.triggerExplosion(jet); 
    }

    // Função para ativar a explosão e finalizar o jogo
    triggerExplosion(jet) {
        // Se o jogo já acabou, não faz nada
        if (this.gameOver) return; 

        // Parando o temporizador de mísseis
        this.missileTimer.remove(); 
        // Posicionando e exibindo a explosão
        this.explosion.setPosition(jet.x, jet.y).setVisible(true); 
        // Parando o movimento do jato
        this.jet.setVelocity(0, 0); 

        // Destruindo o jato após 1 segundo
        this.time.delayedCall(1000, () => {
            this.jet.destroy(); 
            this.explosion.setVisible(false); 
        });

        // Desativando a chama
        this.flame.setVisible(false); 

        // Exibindo o texto de "GAME OVER"
        this.add.text(400, 300, 'GAME OVER', {
            fontSize: '50px',
            fill: 'black',
            fontFamily: 'revamped',
            fontWeight: 'bold'
        }).setOrigin(0.5); 

        // Marcando o jogo como finalizado
        this.gameOver = true; 
        // Pausando a física do jogo
        this.physics.pause(); 

        // Adicionando evento para reiniciar o jogo ao pressionar SPACE
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart(); 
        });
    }
}

// Configurações do jogo
const config = {
    type: Phaser.AUTO, // Tipo de renderização automática (WebGL ou Canvas)
    width: 800, // Largura da tela
    height: 600, // Altura da tela
    scene: [WelcomeScene, GameScene], // Cenas do jogo
    physics: {
        default: 'arcade', // Usando física arcade
        arcade: {
            gravity: { y: 0 }, // Sem gravidade
            debug: false // Desativando o modo de debug
        }
    }
};

// Criando uma instância do jogo com as configurações definidas
const game = new Phaser.Game(config); 
