$(function() {
	let textArena = document.querySelector('.text-area');
	let placeHolder = document.querySelector('textarea').getAttribute('placeholder');
	let inputs = document.querySelectorAll('input, textarea');
	
	function setPlaceHolder(customCase) {
		let textareaz = document.querySelector('textarea');
		if(textareaz.value !== '' || textareaz.value > 1) {
			return;
		}
		textareaz.setAttribute('placeholder', '');
		if(customCase === 'remove') {
			textArena.removeChild(textArena.childNodes[3]);
		}
		if(customCase === 'add') {
			let domPlaceHolder = document.createElement('p');
			domPlaceHolder.innerText = placeHolder;
			domPlaceHolder.addEventListener('click', function() {
				inputs[1].focus();
			})
			textArena.appendChild(domPlaceHolder);
		}
	}

	setPlaceHolder('add');

	
	inputs.forEach((item, index) => {
		item.addEventListener('focus', function() {
			document.getElementsByTagName('body')[0].classList.add('keyboard');
			if(item.classList.contains('formfield__textarea')) {
				setPlaceHolder('remove');
			}
		})
		item.addEventListener('focusout', function() {
			document.getElementsByTagName('body')[0].classList.remove('keyboard');
			if(item.classList.contains('formfield__textarea')) {
				setPlaceHolder('add');
			}
		})
	})


	

	function getOrientation() {
		let bodyTag = document.getElementsByTagName('body')[0];
		if(window.innerWidth > 1.2 * window.innerHeight) {
			bodyTag.querySelector('.change-rotation').classList.add('visible');
			inputs.forEach(item => {
				item.setAttribute('disabled', true);
				setTimeout(()=> {
					item.removeAttribute('disabled');
				}, 10)
			})
		} else {
			bodyTag.querySelector('.change-rotation').classList.remove('visible');
			if(!bodyTag.classList.contains('keyboard')) {
				let vh = window.innerHeight * 0.01;
				document.documentElement.style.setProperty('--vh', `${vh}px`);
			}
		}
	}
	getOrientation();
	window.addEventListener('resize', getOrientation);
	
	let body = $('body');

	setTimeout(() => {
		body.removeClass('opacity');
	}, 200);

	// Вынес почти все переменные, тк были оишбки при пtреходе по #wait, используется до объявления
	let flag = false; //Мой флаг
	let userQuestion = $('.js-repeat-question');
	let historyQuestion;
	let postUserName = {};
	let answerObj = {};
	let input = $('.js-input-val');
	let sendBtn = $('.js-send');
	let arrBtn = $('.header__return.js-return');
	let scaleGroup = $('.js-group-2, .main__scale-wrap');
	let mainBallWrap = $('.js-ball-wraper');
	let video = $('.js-video');
	let lk = $('.js-lk');
	let ball = $('.js-ball');
	let clearAllBals = $('.js-clear-ball');
	let btnLoginUser = "";
	let backUrl = "";
	let disableBackBtn = false;
	// let rights = $('.link');
	let videoBackGround = $('.video-bg');
	let showAnswer = $('.js-show-answer');

	let historyAnswer;
	let returnBack = $('.js-return');

	let csrfParam = {
		name : $('meta[name="csrf-param"]').attr('content'),
		value : $('meta[name="csrf-token"]').attr('content')
	};

	// Объекты ответ-вопрос, который отправляю
	let postObjQuestionAnswer = {};
	if (window.location.hash === '#wait') {
		let lastQuestion = localStorage.getItem('lastQuestion');
		flag = true;
		loadNextScreen(lastQuestion);
	}

	// спрятать-показать
	function showHide(gr1, gr2) {
		gr1.removeClass('visible');
		setTimeout(() => {
			gr1.removeClass('display');
			gr2.addClass('display');
		}, 200);
		setTimeout(() => {
			gr2.addClass('visible');
		}, 201);
	}

	// Группы блоков для показа-скрытия
	let group1 = $('.js-group-1');
	let group2 = $('.js-group-2');
	let group3 = $('.js-group-3');
	let group4 = $('.js-group-4');
	let subGroup4 = $('.js-sub-group-4');
	let group5 = $('.js-group-5');

	// Блок истории - дата, вопрос, ответ
	function createBlockDate(d, m, y, question, answer) {
		let historyFullBlock = $('.history__full-block');
		let historyBlock = $('<div class="history__block" />');
		let historyContent = $('<div class="history__content" />');
		historyBlock.append('<span>' + d + " " + m + " " + y + '</span>');
		historyContent.append('<p>' + "«" + question + "»" + '</p>');
		historyContent.append('<blockquote>' + "«" + answer + "»" + '</blockquote>');
		historyBlock.append(historyContent);
		historyFullBlock.prepend(historyBlock);
	}

	let day, month, year, monthName;
	function dateOfQuestion(time) {
		let newDate = new Date(time);
		day = newDate.getDate();
		month = newDate.getMonth();
		year = newDate.getFullYear();
		switch(month) {
			case 0:
				monthName = 'января';
				break;
			case 1:
				monthName = 'февраля';
				break;
			case 2:
				monthName = 'марта';
				break;
			case 3:
				monthName = 'апреля';
				break;
			case 4:
				monthName = 'мая';
				break;
			case 5:
				monthName = 'июня';
				break;
			case 6:
				monthName = 'июля';
				break;
			case 7:
				monthName = 'августа';
				break;
			case 8:
				monthName = 'сентября';
				break;
			case 9:
				monthName = 'октября';
				break;
			case 10:
				monthName = 'ноября';
				break;
			case 11:
				monthName = 'декабря';
				break;
		}
	}

	// Запомлнение истории из аякса
	function pushHistory(questions, user) {
		if (questions && user) {
			$('.js-lk').addClass('display visible');
			for(let i in questions) {
				dateOfQuestion(questions[i].createdAt * 1000);
				createBlockDate(day, monthName, year, questions[i].question, questions[i].answer);
			}
		}
	}

	function fillAnswerObj(answers) {
		for(let i in answers) {
			answerObj[i] = answers[i];
		}
	}

	let userName = $('.js-user-name');

	let want100Rub = $('.js-ask-100-rub p');
	let fooUnRegisteredUser = "Сегодня судьба тебе улыбнулась, хочешь 100₽ на телефон?";
	let strForLoginUser = "Нужно время подумать? Заходи за порцией вдохновления";
	let want = $('.js-btn-agree');

	const updateData = ({ isRegistered }) => {
		btnLoginUser = isRegistered ? "Войти" : "Хочу";
		let resultStr = isRegistered ? strForLoginUser : fooUnRegisteredUser;
		want.children('span').text(btnLoginUser);
		want100Rub.text(resultStr);
	}

	$.ajax({
		url: "/test.php",
		dataType: "json",
		success: function(data){
			backUrl = data.backUrl;
			arrBtn.attr('href', backUrl);
			if (data.user) {
				flag = true;
				// group1.removeClass('display visible');
				group2.addClass('display visible');
				want.attr('href', data.completeUrl);
				userName.text(data.user.name + '!');
			} else {
				group1.addClass('display visible');
			}
			updateData(data);
			if (data.questions && data.user) {
				pushHistory(data.questions, data.user.name);
			}
			if (data.answers) {
				fillAnswerObj(data.answers);
			}
		},
		error: function() {
			console.log('ошибка сервера');
		}
	});

	// функция дизайбла кнопки
	function disabledBtn(value) {
		if (value.val()) {
			sendBtn.removeAttr('disabled');
		} else {
			sendBtn.attr('disabled', 'true');
		}
	}

	// Ввод имени
	input.on('input', function() {
		disabledBtn($(this));
	});

	// Длина вопроса, задаваемого пользователем
	let textarea = $('.js-textarea');
	let questionLength = $('.js-question-length');

	// Ввод вопроса
	textarea.on('input', function() {
		disabledBtn($(this));
		let l = 75 - $(this).val().length;
		if(l <= 0) {
			l = 0;
		}
		questionLength.text(l);
	});

	function hideReturnBack() {
		returnBack.removeClass('visible');
		setTimeout(() => {
			returnBack.removeClass('display');
		}, 200);
	}

	// Выдача ответа
	function renderAnswer() {
		if (!$.isEmptyObject(answerObj)) {
			let randNumber = Math.floor(Math.random() * 3);
			let color = ".js-sing-";
			let answerLength = answerObj[randNumber].length - 1;
			let randAnswer = Math.round(Math.random() * answerLength);
			historyAnswer = answerObj[randNumber][randAnswer];
			clearAllBals.removeClass('display visible');
			switch(randNumber) {
				case 0:
					color += "green";
					break;
				case 1:
					color += "red";
					break;
				case 2:
					color += "white";
					break;
			}
			setTimeout(() => {
				$(color).addClass('display visible');
			}, 1);
			$('.js-answer blockquote').text("«" + historyAnswer + "»");
			// Добавление в историю
			dateOfQuestion(new Date());
			createBlockDate(day, monthName, year, historyQuestion, historyAnswer);
		}
	}

	function eventEndedVideo(e) {
		setTimeout(() => {
			videoBackGround.removeClass('visible');
			$('.js-clear-ball').removeClass('wraper__ball_fix-anim');
			$('.main__note').css('display','block');
			lk.addClass('display');
			returnBack.addClass('display');
			if (answerObj) {
				renderAnswer();
			}
			showHide(group4, group5);
			// Заполняю объет и отправляю ajax
			postObjQuestionAnswer[csrfParam.name] = csrfParam.value;
			postObjQuestionAnswer.question = historyQuestion + '';
			postObjQuestionAnswer.answer = historyAnswer + '';
			$(function () {
				$.ajax({
					url: "/question/",
					type: "POST",
					dataType: "json",
					data: postObjQuestionAnswer
				});
			})
		}, 300);

		// Показываю хедер
		setTimeout(() => {
			lk.addClass('visible');
			returnBack.addClass('visible');
			video.removeClass('display visible');
			mainBallWrap.removeClass('transform').addClass('normal-state');
			if(arrBtn) {
				arrBtn.attr('href', backUrl);
				disableBackBtn = false;
			}
		}, 301);

	}

	function loadNextScreen(question) {
		if(arrBtn) {
			arrBtn.removeAttr('href');
			disableBackBtn = true;
		}

		localStorage.setItem('lastQuestion', question);
		window.location.hash = "wait";
		// Уезжает кнопка
		$(this).addClass('main__send_translate');
		// ЗХапись вопроса
		userQuestion.text("«" + question + "»");
		historyQuestion = question;
		// scale .4 по по нажатию
		scaleGroup.addClass('scale');
		// Меняю экраны, 1й шар-картинку ставлю z-index: 3, что б он был поверх всех
		setTimeout(() => {
			showHide(group3, group4);
			mainBallWrap.addClass('display');
			body.addClass('display');
			setTimeout(() => {
				returnBack.addClass('visible');
				body.addClass('visible');
				mainBallWrap.addClass('visible');
			}, 1);
		}, 200);
		// Убираю scale у следующих элементов
		setTimeout(() => {
			mainBallWrap.addClass('normal-state');
			group4.removeClass('scale');
		}, 210);
		// Возвращаю кнопку на прежнюю позицию, у предыдущего экрана убираю scale
		setTimeout(() => {
			$(this).removeClass('main__send_translate');
			scaleGroup.removeClass('scale');
		}, 300);
		setTimeout(()=> {
			showAnswer.addClass('shown');
		},600)
		// убираю видимость с шаров и вопроса, убираю у видео прозрачность, прячу вопрос
		showAnswer.on('click', function() {
			subGroup4.removeClass('visible');
			videoBackGround.addClass('visible');
			showAnswer.removeClass('shown');
			$('.main__note').css('display','none');
			$('.js-clear-ball').addClass('wraper__ball_fix-anim');
			setTimeout(()=> {
				video.addClass('visible');
				mainBallWrap.addClass('transform').removeClass('normal-state');
				ball.removeClass('display visible');
			}, 300)

			setTimeout(() => {
				subGroup4.removeClass('display');
				video.addClass('display').get(0).play();
				video[0].addEventListener('ended', eventEndedVideo, false);
			}, 400);
		})
	}

	sendBtn.on('click', function() {
		let value = $(this).siblings().find(input).val();
		let question = $(this).siblings().find(textarea).val();
		if (!flag) {
			postUserName[csrfParam.name] = csrfParam.value;
			userName.text(value + '!');
			postUserName.name = value + "";
			disabledBtn(textarea);
			$.ajax({
				url: "/register/",
				type: "POST",
				dataType: "json",
				data: postUserName
			});
			showHide(group1, group2);
			// rights.addClass('removed');
			flag = !flag;
		} else {
			loadNextScreen(question, userQuestion);
		}
	});

	// Спросить еще раз и кнопка назад
	returnBack.on('click', function(e) {
		if( $(this).attr('href') ===  backUrl) {
			return;
		}
		if (disableBackBtn) {
			e.preventDefault();
			return;
		}
		e.preventDefault();
		video[0].removeEventListener('ended', eventEndedVideo, false);
		body.removeClass('display visible');
		window.location.hash = '';
		hideReturnBack();
		clearAllBals.removeClass('display visible');
		ball.addClass('display visible');
		mainBallWrap.removeClass('display visible transform');
		subGroup4.addClass('display visible');
		textarea.val("");
		questionLength.text(0);
		disabledBtn(textarea);
		group2.addClass('display visible');
		showHide(group5, group3);
	});

	// Попап
	let popup = $('.js-popup');
	$('.js-lk').on('click', function() {
		popup.addClass('display');
		setTimeout(() => {
			popup.addClass('visible');
		}, 1);
	});

	$('.js-close').on('click', function() {
		popup.removeClass('visible');
		setTimeout(() => {
			popup.removeClass('display');
		}, 1);
	});

});