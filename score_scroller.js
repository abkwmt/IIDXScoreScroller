class ScoreScroller {
	static sInstance = null;

	#isMoving = false;
	#barHeight = 0;
	#scrollInterval = 0;
	#scrollAmount = 0;
	#repeatCallback = null;

	constructor()
	{
	}
	
	get cDefaultSpeed() { return 8; }
	get cDefaultBarHeight() { return 128; }
	get cDefaultBeat() { return 4; }

	// HS設定を調べる
	get_hispeed()
	{
		// urlの = の先がHS設定になっている
		let splited = location.href.split('=');
		return (splited.length < 2) ? cDefaultSpeed : parseInt(splited[1]);
	}

	// 一小節のheightを調べる
	get_bar_height()
	{
		// default HS:8 では128pxとなっていて、HS値に比例変化する
		// 冒頭からTableをいくつかチェックし、一番多かった候補を選ぶ
		// （最後の小節だけ短いことがあるため）
		var cCheckNum = 10;

		var keyCounts = {};
		var keyValues = {};

		for (var i = 0; i < cCheckNum; ++i)
		{
			var selector = 'body > table:nth-child(' + i + ')';
			var table = document.querySelector(selector);
			if (table == null)
			{ continue; }

			if (!keyCounts[table.clientHeight])
			{
				keyCounts[table.clientHeight] = 0;
			}
			keyCounts[table.clientHeight]++;
			keyValues[table.clientHeight] = table.clientHeight;
		}

		var key = null;
		var maxCount = 0;
		var maxValue = null;
		for (var j = 0; j < Object.keys(keyCounts); ++j)
		{
			key = Object.keys(keyCounts)[j];
			if (maxCount < keyCounts[key])
			{
				maxCount = keyCounts[key];
				maxValue = keyValues[key];
			}
		}

		return maxValue;
	}

	// hs設定とBarHeightから基本拍子数を算出する
	// (e.g.) hs8, 128pxなら4beat, hs16, 192pxなら3beat
	get_beat(hispeed, barHeight)
	{
		let barHeightDefaultSpeed = (barHeight * this.cDefaultSpeed) / hispeed;
		return barHeightDefaultSpeed * this.cDefaultBeat / this.cDefaultBarHeight;
	}


	dispatch_start()
	{
		if (this.isMoving)
		{ this.stop_scroll(); }
		else
		{ this.start_scroll(); }

		toggle_start_button();
	}

	start_scroll()
	{
		let originBpm = parseInt(document.getElementById('BpmInput').value);
		let bpmRate = parseInt(document.getElementById('BpmRateInput').value);
		let actualBpm = originBpm * (bpmRate / 100.0);

		let hispeed = this.get_hispeed();
		let barHeight = this.get_bar_height(hispeed);
		let beat = this.get_beat(hispeed, barHeight);
		this.refresh_speed(barHeight, actualBpm, beat);

		this.isMoving = true;

		setTimeout("ScoreScroller.Instance.scroll()", this.scrollInterval);
	};

	stop_scroll()
	{
		this.isMoving = false;
		clearTimeout(this.repeatCallback);
	}

	scroll()
	{
		window.scrollBy(0, -this.scrollAmount);

		let scrollEnded = (document.body.scrollTop == 0);
		if (!scrollEnded)
		{
			this.repeatCallback = setTimeout("ScoreScroller.Instance.scroll()", this.scrollInterval);
		}
	}

	refresh_speed(barHeight, bpm, beat)
	{
		// 1beatあたりの高さ
		var beatHeight = barHeight / beat;

		// 1分間のスクロール量
		var scrollAmountByMin = beatHeight * bpm;

		// setIntervalの精度的に厳密な1/60sec(16.666…sec)は指定不可能なため、
		// 16secとして適切なスクロール量を計算する
		this.scrollInterval = 16.0;
		this.scrollAmount = (scrollAmountByMin * this.scrollInterval) / (60.0 * 1000);


		/*
		// 緑数字からScrollAmount, ScrollIntervalを計算
		// green / 10 = 60fpsでの表示フレーム数
		// -> innerHeight分をgreen/(10 * 60) (sec)で移動する
		var windowHeight = window.innerHeight;
		var displayTimeMsec = bpm * 1000.0 / 600.0;

		// setIntervalの精度的に厳密な1/60sec(16.666…sec)は指定不可能なため、
		// 16secとして適切なスクロール量を計算する
		scrollInterval = 16.0;

		scrollAmount = (windowHeight * scrollInterval) / displayTimeMsec;
		*/
	}


	static get Instance() {
		if (this.sInstance == null)
		{
			this.sInstance = new ScoreScroller();
		}
		return this.sInstance;
	}
}

function toggle_start_button()
{
	var button = document.getElementById('StartButton');
	if (button.value == 'START')
	{ button.value = 'STOP'; }
	else
	{ button.value = 'START'; }
}

function add_gui(base, div_classname, prefix_text, inputFunc, suffix)
{
	var div = document.createElement('div');
	div.className = div_classname;

	var label = document.createElement('label');
	label.innerText = prefix_text;
	div.appendChild(label);

	var input = inputFunc();
	div.appendChild(input);

	if (suffix != null && suffix != "")
	{
		var suffixLabel = document.createElement('label');
		suffixLabel.innerText = suffix;
		div.appendChild(suffixLabel);
	}

	base.appendChild(div);
}

function regist_controls()
{
	var base = document.createElement('div');
	base.className = 'floating';

	var button = document.createElement('input');
	button.className = 'start_button';
	button.type = 'button';
	button.value = 'START';
	button.id = 'StartButton';
	button.addEventListener('click', () => {
		ScoreScroller.Instance.dispatch_start();
	}, false);

	base.appendChild(button);

	function createBpmInput()
	{
		var input = document.createElement('input');
		input.type = 'number';
		input.value = get_page_bpm();
		input.id = 'BpmInput';
		input.min = 0;
		input.max = 800;
		return input;
	}
	add_gui(base, 'bpm', 'bpm:  ', createBpmInput, null);

	function createBpmRateInput()
	{
		var input = document.createElement('input');
		input.type = 'number';
		input.value = get_page_bpm();
		input.id = 'BpmInput';
		input.min = 0;
		input.max = 800;
		return input;
	}
	add_gui(base, 'bpm_rate', 'bpm rate: ', createBpmRateInput, ' %');

	document.body.appendChild(base);
};

function get_page_bpm()
{
	var bpmTxt = document.querySelector("body > nobr").innerText;
	var bpmSubStr = bpmTxt.substr(bpmTxt.lastIndexOf('bpm:')+4, 4);
	return parseInt(bpmSubStr);
}

regist_controls();
