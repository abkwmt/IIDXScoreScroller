var gBarHeight = 0;
var scrollInterval = 16;
var scrollAmount = 0;
var repeatCallback = null;


function start_scroll()
{
	var bpm = parseInt(document.getElementById('BpmInput').value);

	if (gBarHeight == 0)
	{
		gBarHeight = get_bar_height();
	}
	refresh_speed(gBarHeight, bpm, 4);
	setTimeout("scroll()", scrollInterval);
};

// 一小節のheightを調べる
function get_bar_height()
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

function refresh_speed(barHeight, bpm, beat)
{
	// 1beatあたりの高さ
	var beatHeight = barHeight / beat;

	// 1分間のスクロール量
	var scrollAmountByMin = beatHeight * bpm;

	// setIntervalの精度的に厳密な1/60sec(16.666…sec)は指定不可能なため、
	// 16secとして適切なスクロール量を計算する
	scrollInterval = 16.0;
	scrollAmount = (scrollAmountByMin * scrollInterval) / (60.0 * 1000);


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

function stop_scroll()
{
	clearTimeout(repeatCallback);
}

function scroll()
{
	window.scrollBy(0, -scrollAmount);

	var scrollEnded = (document.body.scrollTop == 0);
	if (!scrollEnded)
	{
		repeatCallback = setTimeout("scroll()", scrollInterval);
	}
};


function regist_controls()
{
	var base = document.createElement('div');
	base.className = 'floating';

	var button = document.createElement('input');
	button.className = 'start_button';
	button.type = 'button';
	button.value = 'START';
	button.addEventListener('click', () => {
		start_scroll();
	}, false);

	base.appendChild(button);

	var bpmDiv = document.createElement('div');
	bpmDiv.className = 'bpm';
	var bpmLabel = document.createElement('label');
	bpmLabel.innerText = 'bpm:  ';
	bpmDiv.appendChild(bpmLabel);

	var bpmInput = document.createElement('input');
	bpmInput.type = 'number';
	bpmInput.value = 300;
	bpmInput.id = 'BpmInput';
	bpmInput.min = 0;
	bpmInput.max = 800;
	bpmDiv.appendChild(bpmInput);

	base.appendChild(bpmDiv);

	document.body.appendChild(base);
};

regist_controls();
