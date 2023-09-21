class AnimationProcessor {

	video = document.getElementById("krosh-video");
	kill = document.getElementById("kill");
	tmp = document.getElementById("tmp");
	killCtx = this.kill.getContext("2d");
	tmpCtx = this.tmp.getContext("2d");

	resizeCanvases() {
		const iw = window.innerWidth,
			sx = 3,
			sy = 3,
			ih = window.innerHeight;
		this.kill.width = iw;
		this.kill.height = ih;
		this.tmp.width = iw;
		this.tmp.height = ih;
		this.video.width = iw;
		this.video.height = ih;

		this.kill.style.transform = `scale(${sx}, ${sy})`;
		// this.kill.style.left = 1000 + 'px';
		// this.kill.style.top = 380 + 'px';
		this.kill.style.left = iw + 'px';
		this.kill.style.top = ih/2+200 + 'px';


	}

	nextFrame() {
		if (this.video.paused || this.video.ended) {
			this.clearVideo();
		} else {
			this.resizeCanvases();
			this.drawVideoFrame();

		}
		window.requestAnimationFrame(this.nextFrame.bind(this));
	}

	clearVideo() {
		this.killCtx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight);
	}

	drawVideoFrame() {
		let [w, h] = [this.video.videoWidth, this.video.videoHeight];
		this.tmpCtx.drawImage(this.video, 0, 0, w, h);

		const frame = this.tmpCtx.getImageData(0, 0, w, h);


		this.killCtx.putImageData(frame, 0, 0);
	}

	async shoot(x, y, r, check) {
		if (check) {
			this.video = document.getElementById("krosh-video");

		} else {
			this.video = document.getElementById("pin-video");

		}

		await this.video.play();

		window.requestAnimationFrame(this.nextFrame.bind(this));
		await new Promise(res => setTimeout(res, 900));
	}
}