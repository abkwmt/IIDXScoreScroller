(function () {

	class Setting {

		constructor()
		{
			this.bpm = 0;
			this.bpmRate = 100;
			this.startPointEnabled = false;
			this.startPoint = 0.0;
			this.endPointEnabled = false;
			this.endPoint = 0.0;
			this.threeCount = false;
			this.autoRepeat = false;
			this.laneCoverLength = 0;
			this.laneCoverEnabled = false;
		}

		load_from_ui()
		{
			this.bpm = parseInt(document.getElementById('BpmInput').value);
			this.bpmRate = parseInt(document.getElementById('BpmRateInput').value);

			this.startPointEnabled = document.getElementById('StartPointEnabled').checked;
			this.startPoint = parseInt(document.getElementById('StartPointInput').value); 

			this.endPointEnabled = document.getElementById('EndPointEnabled').checked;
			this.endPoint = parseInt(document.getElementById('EndPointInput').value); 

			this.threeCount = document.getElementById('ThreeCountEnabled').checked;
			this.autoRepeat = document.getElementById('AutoRepeatEnabled').checked;

			this.laneCoverLength = document.getElementById('LaneCoverInput').value;
			this.laneCoverEnabled = document.getElementById('LaneCoverEnabled').checked;
		}

		set_to_ui()
		{
			document.getElementById('BpmInput').value = this.bpm;
			document.getElementById('BpmRateInput').value = this.bpmRate;

			document.getElementById('StartPointEnabled').checked = this.startPointEnabled;
			document.getElementById('StartPointInput').value = this.startPoint;

			document.getElementById('EndPointEnabled').checked = this.endPointEnabled;
			document.getElementById('EndPointInput').value = this.endPoint;

			document.getElementById('ThreeCountEnabled').checked = this.threeCount;
			document.getElementById('AutoRepeatEnabled').checked = this.autoRepeat;

			document.getElementById('LaneCoverInput').value = this.laneCoverLength;
			document.getElementById('LaneCoverEnabled').checked = this.laneCoverEnabled;
		}

		load_from_storage(callback)
		{
			let key_url = Setting.get_key_url();
			chrome.storage.local.get([key_url], (loaded) =>  {
				console.log("get storage : " + key_url);
				if (loaded[key_url])
				{
					console.log("content : " + loaded[key_url]);
					this.from_json(loaded[key_url]);
					this.set_to_ui();
					callback();
				}
				else
				{
					console.log("content not found.");
				}
			});
		}

		store_to_storage()
		{
			let key_url = Setting.get_key_url();
			let saves = {};
			saves[key_url] = JSON.stringify(this);
			chrome.storage.local.set(saves, () => {
				console.log("set storage : " + key_url);
			});
		}

		from_json(json_str)
		{
			if (!json_str) { return; }

			let json = JSON.parse(json_str);
			for (let [k,v] of Object.entries(json))
			{
				if (typeof(this[k]) == "undefined")
				{ continue; }

				this[k] = v;
			}
		}

		static get_key_url()
		{
			let indexOfParam = location.href.indexOf('?');
			if (indexOfParam == -1)
			{ return location.href; }
			else
			{ return location.href.substring(0, indexOfParam); } 
		}
	}

	class CountDowner {
		constructor()
		{
			this.count = 0;
		}

		start_count()
		{
			this.count = 3;
			this.update_display(this.count);
			setTimeout(() => { this.update_count(); }, 500);
		}

		is_count_finished()
		{
			return this.count == 0;
		}

		update_count()
		{
			this.count -= 1;
			this.update_display(this.count);
			if (!this.is_count_finished()) 
			{
				setTimeout(() => { this.update_count(); }, 500);
			}
		}

		update_display(count)
		{
			let elm = document.getElementById('ThreeCount');
			elm.innerText = (count == 0) ? "" : count;
		}
	}

	class GuiComponent {

		regist_controls(controller)
		{
			// 譜面を最後までスクロールさせるために冒頭にスペーサーを入れる
			var spacer = document.createElement('div');
			spacer.className = 'spacer';
			var topTable = document.querySelector("body > table:nth-child(3)");
			document.body.insertBefore(spacer, topTable);


			var base = document.createElement('div');
			base.className = 'floating';
			base.style = '--zoom:' + ((window.outerWidth - 16) / window.innerWidth);

			var button = document.createElement('input');
			button.className = 'start_button';
			button.type = 'button';
			button.value = 'START';
			button.id = 'StartButton';
			button.addEventListener('click', () => {
				controller.dispatch_start_button();
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
			this.add_gui(base, 'gui_div', 'bpm rate: ', createBpmRateInput, '');

			function createThreeCountInput()
			{
				var input = document.createElement('input');
				input.type = 'checkbox';
				input.className = 'gui_div';
				input.checked = false;
				input.id = 'ThreeCountEnabled';
				return input;
			}
			this.add_gui(base, 'gui_div', 'three count: ', createThreeCountInput, null);

			function createAutoRepeatInput()
			{
				var input = document.createElement('input');
				input.type = 'checkbox';
				input.className = 'gui_div';
				input.checked = false;
				input.id = 'AutoRepeatEnabled';
				return input;
			}
			this.add_gui(base, 'gui_div', 'auto repeat: ', createAutoRepeatInput, null);

			function createStartPointInput()
			{
				var input = document.createElement('input');
				input.type = 'number';
				input.className = 'gui_textbox';
				input.value = 0;
				input.id = 'StartPointInput';
				input.min = 0;
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
			this.add_point_gui(base, 'gui_div', 'start point: ', createStartPointInput, '',
				createStartPointEnableCheck, createStartPointSet);
			
			function createEndPointInput()
			{
				var input = document.createElement('input');
				input.type = 'number';
				input.className = 'gui_textbox';
				input.value = 100;
				input.id = 'EndPointInput';
				input.min = 0;
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
			this.add_point_gui(base, 'gui_div', 'end point: ', createEndPointInput, '',
				createEndPointEnableCheck, createEndPointSet);

			function createLaneCoverLength()
			{
				var input = document.createElement('input');
				input.type = 'number';
				input.className = 'gui_textbox';
				input.value = 0;
				input.id = 'LaneCoverInput';
				input.min = 0;
				input.step = 5;
				input.addEventListener('change', () => {
					controller.refresh_lane_cover();
				}, false);
				return input;
			}

			function createLaneCoverEnableCheck()
			{
				var input = document.createElement('input');
				input.type = 'checkbox';
				input.className = 'gui_div';
				input.checked = false;
				input.id = 'LaneCoverEnabled';
				input.addEventListener('change', () => {
					controller.refresh_lane_cover();
				}, false);
				return input;
			}
			this.add_point_gui(base, 'gui_div', 'lane cover: ', createLaneCoverLength, ' %',
				createLaneCoverEnableCheck, null);

			document.body.appendChild(base);


			// three count表示用
			var threecount = document.createElement('div');
			threecount.className = 'three_count';
			threecount.style = '--zoom:' + ((window.outerWidth - 16) / window.innerWidth);
			threecount.id = 'ThreeCount';
			document.body.appendChild(threecount);

			// LaneCover描画用
			var laneCover = document.createElement('div');
			laneCover.className = 'lane_cover';
			laneCover.id = 'LaneCover';
			document.body.appendChild(laneCover);
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

			if (enableInputFunc != null)
			{ div.appendChild(enableInputFunc()); }

			if (setInputFunc != null)
			{ div.appendChild(setInputFunc()); }

			base.appendChild(div);
		}

		static set_current_start()
		{
			document.getElementById('StartPointInput').value = document.body.scrollTop;
			document.getElementById('StartPointEnabled').checked = true;
		}

		static set_current_end()
		{
			document.getElementById('EndPointInput').value = document.body.scrollTop;
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

		static refresh_lane_cover(disp, length)
		{
			var lc = document.getElementById('LaneCover');
			if (disp)
			{
				lc.style.display = "block";
				lc.style.height = (length * document.body.clientHeight / 100) + "px";
			}
			else
			{
				lc.style.display = "none";
			}
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
			this.gui.regist_controls(this);
			
			this.setting = new Setting();
			this.setting.load_from_storage(() => { this.redraw_lane_cover(); });
			this.countdown = new CountDowner();
		}
		
		get cDefaultSpeed() { return 8; }
		get cDefaultBarHeight() { return 128; }
		get cDefaultBeat() { return 4; }

		// HS設定を調べる
		get_hispeed()
		{
			// urlの = の先がHS設定になっている
			let splited = location.href.split('=');
			return (splited.length < 2) ? this.cDefaultSpeed : parseInt(splited[1]);
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


		dispatch_start_button()
		{
			this.setting = new Setting();
			this.setting.load_from_ui();
			this.setting.store_to_storage();

			if (this.isMoving)
			{
				this.stop_scroll(); 
				GuiComponent.toggle_start_button(true);
			}
			else
			{
				if (this.setting.startPointEnabled && this.setting.endPointEnabled &&
					this.setting.startPoint <= this.setting.endPoint)
				{
					alert("startPointよりも手前にendPointが設定されています");
					return;
				}

				this.start_scroll(); 
				GuiComponent.toggle_start_button(false);
			}
		}

		refresh_lane_cover()
		{
			this.setting = new Setting();
			this.setting.load_from_ui();
			this.setting.store_to_storage();

			this.redraw_lane_cover();
		}

		redraw_lane_cover()
		{
			GuiComponent.refresh_lane_cover(this.setting.laneCoverEnabled, this.setting.laneCoverLength);
		}

		start_scroll()
		{
			let actualBpm = this.setting.bpm * (this.setting.bpmRate / 100.0);

			let hispeed = this.get_hispeed();
			let barHeight = this.get_bar_height(hispeed);
			let beat = this.get_beat(hispeed, barHeight);
			this.refresh_speed(barHeight, actualBpm, beat);

			if (this.setting.startPointEnabled)
			{ 
				window.scroll(0, this.setting.startPoint);
			}

			this.EndPointEnabled = document.getElementById('EndPointEnabled').checked;
			if (this.EndPointEnabled)
			{ 
				this.endPoint = this.setting.endPoint;
			}

			this.isMoving = true;
			if (this.setting.threeCount)
			{
				this.countdown.start_count();
			}

			setTimeout(() => { this.scroll(); }, this.scrollInterval);
		};

		stop_scroll()
		{
			if (this.setting.startPointEnabled)
			{ 
				window.scroll(0, this.setting.startPoint);
			}
			
			this.isMoving = false;
			GuiComponent.toggle_start_button(true);
			clearTimeout(this.repeatCallback);
		}

		repeat_scroll()
		{
			if (this.setting.startPointEnabled)
			{
				window.scroll(0, this.setting.startPoint);
			}
			else
			{
				// startPointが設定されてない場合は一番下まで戻すか
				window.scroll(0, this.setting.scrollHeight);
			}

			this.start_scroll();
		}

		scroll()
		{
			if (this.setting.threeCount && !this.countdown.is_count_finished())
			{
				this.repeatCallback = setTimeout(() => { this.scroll(); }, this.scrollInterval);
				return;
			}

			window.scrollBy(0, -this.scrollAmount);

			let scrollEnded = this.EndPointEnabled ?
				(document.body.scrollTop <= this.endPoint) :
				(document.body.scrollTop == 0);
			if (scrollEnded)
			{
				if (this.setting.autoRepeat)
				{
					this.repeat_scroll();
				}
				else
				{
					this.stop_scroll();
				}
			}
			else
			{
				this.repeatCallback = setTimeout(() => { this.scroll(); }, this.scrollInterval);
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

	// URLがindex.html だった場合は曲一覧ページなので処理を行わない
	if (location.href.includes('index.html'))
	{ return; }
	
	var scroller = new ScoreScroller();
})();
