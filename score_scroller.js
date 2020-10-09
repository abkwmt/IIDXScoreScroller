(function () {

	class Setting {
		#bpm = 0;
		#bpmRate = 100;
		#startPointEnabled = false;
		#startPointPercent = 0;
		#endPointEnabled = false;
		#endPointPercent = 0;

		load_from_ui()
		{
			this.bpm = parseInt(document.getElementById('BpmInput').value);
			this.bpmRate = parseInt(document.getElementById('BpmRateInput').value);

			this.StartPointEnabled = document.getElementById('StartPointEnabled').checked;
			if (this.StartPointEnabled)
			{ 
				this.startPointPercent = parseInt(document.getElementById('StartPointInput').value); 
			}

			this.EndPointEnabled = document.getElementById('EndPointEnabled').checked;
			if (this.EndPointEnabled)
			{ 
				this.endPointPercent = parseInt(document.getElementById('EndPointInput').value); 
			}
		}
	}

	class GuiComponent {

		regist_controls(start_callback)
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
				start_callback();
			}, false);

			base.appendChild(button);

			function createBpmInput()
			{
				var input = document.createElement('input');
				input.type = 'number';
				input.className = 'gui_textbox';
				input.value = GuiComponent.get_page_bpm();
				input.id = 'BpmInput';
				input.min = 0;
				input.max = 800;
				return input;
			}
			this.add_gui(base, 'gui_div', 'bpm:  ', createBpmInput, null);

			function createBpmRateInput()
			{
				var input = document.createElement('input');
				input.type = 'number';
				input.className = 'gui_textbox';
				input.value = 100;
				input.id = 'BpmRateInput';
				input.min = 0;
				input.step = 5;
				input.max = 100;
				return input;
			}
			this.add_gui(base, 'gui_div', 'bpm rate: ', createBpmRateInput, ' %');

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
				input.addEventListener('click', () => {
					GuiComponent.set_current_start();
				}, false);
				return input;
			}
			this.add_point_gui(base, 'gui_div', 'start point: ', createStartPointInput, ' %',
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
				input.addEventListener('click', () => {
					GuiComponent.set_current_end();
				}, false);
				return input;
			}
			this.add_point_gui(base, 'gui_div', 'end point: ', createEndPointInput, ' %',
				createEndPointEnableCheck, createEndPointSet);

			document.body.appendChild(base);
		};


		add_gui(base, div_classname, prefix_text, inputFunc, suffix)
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

		add_point_gui(base, div_classname, prefix_text, inputFunc, suffix, enableInputFunc, setInputFunc)
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

		static set_current_start()
		{
			let percent = -(document.body.scrollTop * 100 / document.body.scrollHeight - 100);
			percent = Math.round(percent * 100) / 100;
			document.getElementById('StartPointInput').value = percent;

			document.getElementById('StartPointEnabled').checked = true;
		}

		static set_current_end()
		{
			let percent = -(document.body.scrollTop * 100 / document.body.scrollHeight - 100);
			percent = Math.round(percent * 100) / 100;
			document.getElementById('EndPointInput').value = percent;

			document.getElementById('EndPointEnabled').checked = true;
		}

		static get_page_bpm()
		{
			var bpmTxt = document.querySelector("body > nobr").innerText;
			var bpmSubStr = bpmTxt.substr(bpmTxt.lastIndexOf('bpm:')+4, 4);
			return parseInt(bpmSubStr);
		}

		static toggle_start_button(tobeStart)
		{
			var button = document.getElementById('StartButton');
			if (tobeStart)
			{ button.value = 'START'; }
			else
			{ button.value = 'STOP'; }
		}
	}

	class ScoreScroller {
		static sInstance = null;

		#isMoving = false;

		#barHeight = 0;
		#scrollInterval = 0;
		#scrollAmount = 0;
		#repeatCallback = null;

		#setting = null;
		#gui = null;

		constructor() 
		{ 
			this.gui = new GuiComponent();
			this.gui.regist_controls(this.dispatch_start);
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
			this.setting = new Setting();
			this.setting.load_from_ui();

			if (this.isMoving)
			{
				this.stop_scroll(); 
				GuiComponent.toggle_start_button(true);
			}
			else
			{
				this.start_scroll(); 
				GuiComponent.toggle_start_button(false);
			}
		}

		start_scroll()
		{
			let actualBpm = this.setting.bpm * (this.setting.bpmRate / 100.0);

			let hispeed = this.get_hispeed();
			let barHeight = this.get_bar_height(hispeed);
			let beat = this.get_beat(hispeed, barHeight);
			this.refresh_speed(barHeight, actualBpm, beat);

			if (this.setting.StartPointEnabled)
			{ 
				let startPoint = document.body.scrollHeight * (100 - this.setting.startPointPercent) / 100;
				window.scroll(0, startPoint);
			}

			this.EndPointEnabled = document.getElementById('EndPointEnabled').checked;
			if (this.EndPointEnabled)
			{ 
				this.endPoint = document.body.scrollHeight * (100 - this.setting.endPointPercent) / 100;
			}

			this.isMoving = true;

			setTimeout("ScoreScroller.Instance.scroll()", this.scrollInterval);
		};

		stop_scroll()
		{
			if (this.setting.StartPointEnabled)
			{ 
				window.scroll(0, this.startPoint);
			}
			
			this.isMoving = false;
			this.gui.toggle_start_button(true);
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

	var scroller = new ScoreScroller();
})();
