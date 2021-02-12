window.addEventListener("load", function () {
  let canvas = document.getElementById("gameCanvas");
  let ctx = canvas.getContext("2d");
  let panel_Width = 50 - 20;
  let panel_Height = 40;
  let panel_color = "#fff";
  let panel_space = 130;
  let panelsArr = [];
  let player_width = 50;
  let player_height = 60;
  let player_color = "#F55";
  let player = {
    x: null,
    y: null,
    height: player_height,
    width: player_width,
    isJumpUp: false,
    isHmove: false,
    dirH: "left",
    level: 1,
    score: 0,
    lastScore: 0,
    fallDown: 0,
  };
  let isRunning = false;
  let playerImg = document.createElement("img");
  playerImg.src = "./img/player.png";
  let panelImg = document.createElement("img");
  panelImg.src = "./img/png-platform-3.png";
  let bgAudio = new Audio("./media/bg_audio.mp3");
  bgAudio.load();
  bgAudio.volume = 0.3;
  bgAudio.loop = true;
  let scoreEl = document.querySelector("#score");
  let adviceMsgEl = document.querySelector("#adviceMsg");
  let modalEl = document.querySelector(".game_wrapper .modal");
  function update() {
    for (let i = 0; i < panelsArr.length; i++) {
      // detectCollision for panels and player
      if (
        detectCollision(panelsArr[i], player) &&
        !player.isJumpUp &&
        panelsArr[i].y >= player.height
      ) {
        player.y = panelsArr[i].y - player.height;
        player.isOn = true;
        break;
      } else {
        player.isOn = false;
      }
    }
    if (!player.isOn && !player.isJumpUp) {
      // player is falling
      player.y += 8;
    } else if (player.isJumpUp && player.y > 0) {
      // player is jumping
      player.y -= 6;
    } else {
      // player moves with panel
      player.y += 2 * player.level + player.fallDown;
    }
    // player left and right movment
    if (player.isHmove) {
      if (player.dirH == "left" && player.x > 0) {
        player.x -= 8;
      } else if (
        player.dirH == "right" &&
        player.x < canvas.width - player.width
      ) {
        player.x += 8;
      }
    }
    // move panels
    panelsArr.forEach(function (panel, i) {
      if (player.isOn) {
        panelsArr[i].y += 2 * player.level + player.fallDown;
      }
    });
    if (player.y >= canvas.height) {
      // game over
      isRunning = false;
      bgAudio.pause();
      modalEl.classList.add("active");
      modalEl.classList.add("ended");
      scoreEl.innerHTML = player.score;
      if (player.lastScore === 0) {
        adviceMsgEl.innerHTML = "Not Bad for your first try";
        player.lastScore = player.score;
      } else if (player.lastScore < player.score) {
        adviceMsgEl.innerHTML = "Wow! you just broke your own Recored";
        player.lastScore = player.score;
      } else if (player.lastScore > player.score) {
        adviceMsgEl.innerHTML = "Come on! I saw you do better";
      } else if (player.lastScore === player.score) {
        adviceMsgEl.innerHTML = "Good you have done it again";
      }
    } else if (player.y <= 0) {
      // player reached the top while jumping
      player.isJumpUp = false;
    }
    // remove out of view panel
    if (panelsArr[0].y >= canvas.height) {
      panelsArr.shift();
      player.score += 10;
      // level up
      if (player.score % 50 == 0) {
        player.level++;
      }
    }
    // add new panel to the top
    if (panelsArr[panelsArr.length - 1].y >= panel_space - panel_Height) {
      createRandomPanels(1);
    }
  }
  function draw() {
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw panels
    panelsArr.forEach(function (el) {
      ctx.fillStyle = panel_color;
      ctx.drawImage(panelImg, el.x - 20, el.y, panel_Width + 50, panel_Height);
    });
    //   let imgUrl = URL.createObjectURL("./img/player.png");
    // draw player
    ctx.fillStyle = player_color;
    ctx.drawImage(
      playerImg,
      player.x,
      player.y,
      player_width,
      player_height + 20
    );
    // draw text
    ctx.fillStyle = "#444";
    ctx.font = "16px Arial";
    ctx.fillText("Level: " + player.level, 10, 30);
    ctx.fillText(
      "Score: " + player.score,
      canvas.width - player.score.toString().length * 10 - 60,
      30
    );
  }
  function createRandomPanels(n = 1) {
    if (n > 10) n = 10;
    for (let i = 0; i < n; i++) {
      let panel = {
        x: Math.floor(Math.random() * (canvas.width - panel_Width - 10)),
        y: canvas.height - 80,
        height: panel_Height,
        width: panel_Width,
      };
      if (panelsArr.length) {
        panel.y = panelsArr[panelsArr.length - 1].y - panel_space - 20;
      } else {
        panel.y = canvas.height - 60;
      }

      panelsArr.push(panel);
    }
  }
  function detectCollision(a, b) {
    let w =
      a.x - b.x <= 0
        ? Math.abs(a.x - b.x) <= a.width
        : Math.abs(a.x - b.x) <= b.width;
    let h =
      a.y - b.y <= 0
        ? Math.abs(a.y - b.y) <= a.height
        : Math.abs(a.y - b.y) <= b.height;
    return w && h;
  }

  let frameTimer = setInterval(function () {
    if (!isRunning) {
      return false;
    }
    update();
    draw();
  }, 60);
  function startOver() {
    panelsArr = [];
    createRandomPanels(5);
    player.x = panelsArr[0].x;
    player.y = panelsArr[0].y - player_height + 10;
    player.score = 0;
    player.level = 1;
    draw();
    isRunning = true;
    bgAudio.currentTime = 0;
    bgAudio.play();
    modalEl.classList.remove("active");
  }
  window.addEventListener("keydown", function (e) {
    if (e.key == "ArrowRight") {
      player.isHmove = true;
      player.dirH = "right";
    }
    if (e.key == "ArrowLeft") {
      player.isHmove = true;
      player.dirH = "left";
    }
    if (e.key == "ArrowUp" && player.isOn) {
      player.isJumpUp = true;
    }
    if (e.key == "ArrowDown") {
      player.fallDown = 5;
    }
  });
  window.addEventListener("keyup", function (e) {
    if (e.key == "ArrowRight" || e.key == "ArrowLeft") {
      player.isHmove = false;
    }
    if (e.key == "ArrowUp") {
      player.isJumpUp = false;
    }
    if (e.key == "ArrowDown") {
      player.fallDown = 0;
    }
  });
  document.querySelectorAll(".btn-rest,.btn-start").forEach(function (el) {
    el.addEventListener("click", startOver);
  });
});
