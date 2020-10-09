class ScoreScroller {
	static sInstance = null;

	#isMoving = false;

	#barHeight = 0;
	#scrollInterval = 0;
	#scrollAmount = 0;
	#startPointEnabled = false;
	#startPoint = 0;
	#endPointEnabled = false;
	#endPoint = 0;
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
		{
			this.stop_scroll(); 
			toggle_start_button(true);
		}
		else
		{
			this.start_scroll(); 
			toggle_start_button(false);
		}

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

		this.StartPointEnabled = document.getElementById('StartPointEnabled').checked;
		if (this.StartPointEnabled)
		{ 
			let startPointPercent = parseInt(document.getElementById('StartPointInput').value); 
			this.startPoint = document.body.scrollHeight * (100 - startPointPercent) / 100;
			window.scroll(0, this.startPoint);
		}

		this.EndPointEnabled = document.getElementById('EndPointEnabled').checked;
		if (this.EndPointEnabled)
		{ 
			let endPointPercent = parseInt(document.getElementById('EndPointInput').value); 
			this.endPoint = document.body.scrollHeight * (100 - endPointPercent) / 100;
		}

		this.isMoving = true;

		setTimeout("ScoreScroller.Instance.scroll()", this.scrollInterval);
	};

	stop_scroll()
	{
		if (this.StartPointEnabled)
		{ 
			window.scroll(0, this.startPoint);
		}
		
		this.isMoving = false;
		toggle_start_button(true);
		clearTimeout(this.repeatCallback);
	}

	scroll()
	{
		window.scrollBy(0, -this.scrollAmount);

		let scrollEnded = this.EndPointEnabled ?
			(document.body.scrollTop <= this.endPoint) :
			(document.body.scrollTop == 0);
		if (scrollEnded)
		{
			this.stop_scroll();
		}
		else
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

function toggle_start_button(tobeStart)
{
	var button = document.getElementById('StartButton');
	if (tobeStart)
	{ button.value = 'START'; }
	else
	{ button.value = 'STOP'; }
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

function add_point_gui(base, div_classname, prefix_text, inputFunc, suffix, enableInputFunc, setInputFunc)
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

	div.appendChild(enableInputFunc());
	div.appendChild(setInputFunc());

	base.appendChild(div);
}

function regist_controls()
{
	var base = document.createElement('div');
	base.className = 'floating';
	base.style = '--zoom:' + ((window.outerWidth - 16) / window.innerWidth);

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
		input.className = 'gui_textbox';
		input.value = get_page_bpm();
		input.id = 'BpmInput';
		input.min = 0;
		input.max = 800;
		return input;
	}
	add_gui(base, 'gui_div', 'bpm:  ', createBpmInput, null);

	function createBpmRateInput()
	{
		var input = document.createElement('input');
		input.type = 'number';
		input.className = 'gui_textbox';
		input.value = 100;
		input.id = 'BpmRateInput';
		input.min = 0;
		input.max = 100;
		return input;
	}
	add_gui(base, 'gui_div', 'bpm rate: ', createBpmRateInput, ' %');

	function createStartPointInput()
	{
		var input = document.createElement('input');
		input.type = 'number';
		input.className = 'gui_textbox';
		input.value = 0;
		input.id = 'StartPointInput';
		input.min = 0;
		input.max = 100;
		return input;
	}
	function createStartPointEnableCheck()
	{
		var input = document.createElement('input');
		input.type = 'checkbox';
		input.className = 'gui_div';
		input.checked = false;
		input.id = 'StartPointEnabled';
		return input;
	}
	function createStartPointSet()
	{
		var input = document.createElement('input');
		input.type = 'button';
		input.className = 'gui_div';
		input.value = 'Set';
		input.id = 'StartPointSet';
		return input;
	}
	add_point_gui(base, 'gui_div', 'start point: ', createStartPointInput, ' %',
		createStartPointEnableCheck, createStartPointSet);
	
	function createEndPointInput()
	{
		var input = document.createElement('input');
		input.type = 'number';
		input.className = 'gui_textbox';
		input.value = 100;
		input.id = 'EndPointInput';
		input.min = 0;
		input.max = 100;
		return input;
	}
	function createEndPointEnableCheck()
	{
		var input = document.createElement('input');
		input.type = 'checkbox';
		input.className = 'gui_div';
		input.checked = false;
		input.id = 'EndPointEnabled';
		return input;
	}
	function createEndPointSet()
	{
		var input = document.createElement('input');
		input.type = 'button';
		input.className = 'gui_div';
		input.value = 'Set';
		input.id = 'EndPointSet';
		return input;
	}
	add_point_gui(base, 'gui_div', 'end point: ', createEndPointInput, ' %',
		createEndPointEnableCheck, createEndPointSet);

	document.body.appendChild(base);
};

function get_page_bpm()
{
	var bpmTxt = document.querySelector("body > nobr").innerText;
	var bpmSubStr = bpmTxt.substr(bpmTxt.lastIndexOf('bpm:')+4, 4);
	return parseInt(bpmSubStr);
}

regist_controls();
