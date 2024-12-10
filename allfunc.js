var allFunc = []
function updateTitle() {
    if (timersAdsDirect.length > 0) {
        document.title = timersAdsDirect.map(timersAds => `${timersAds.startTimer} сек`).join(' • ');
    } else {
        document.title = 'Youtube заработок';
    }
}

function addTimer(id, seconds = 0) {
    let newTimer = {
        id: `ads_${id}`,
        idCampaign: id,
        startTimer: seconds,
    };
    setTimeout(function () {
        addOrUpdateTimer(newTimer);
        workerAdsDirect.postMessage({action: 'start', timer: newTimer});
        updateTitle();
        $("#start-ads-" + id).css({"display": "none"});
        $("#timer_ads_" + id).html(seconds);
        $("#started-ads-" + id).css({"display": "block"});
        clearInterval(stop_tit);
    }, 2000)
}

function addOrUpdateTimer(newTimer) {
    const index = timersAdsDirect.findIndex(timer => timer.idCampaign === newTimer.idCampaign);
    if (index !== -1) {
        timersAdsDirect[index] = newTimer;
    } else {
        timersAdsDirect.push(newTimer);
    }
}

function updateTimerElement(timerId) {
    if (timersAdsDirect.length > 0) {
        timersAdsDirect.map((timer) => {
            $(`#timer_ads_${timer.idCampaign}`).html(timer.startTimer);
        })
    }
}



allFunc['viewCheckDirect'] = function (taskId) {
    if (!sendConfirmBtn) {
        sendConfirmBtn = true;
        let reportId = $("#ads_report_id_" + taskId).val();
        let hash = $("#ads_hash_" + taskId).val();
        let videoId = $("#ads_video_id_" + taskId).val();
        let timer = $("#ads_timer_" + taskId).val();
        let errorElem = $("#ads_error_text_" + taskId);
        let errorBtnView = $("#btn_error_view_" + taskId);
        let successText = $("#start-ads-" + taskId);
        let btnCheckingBlock = $("#ads_checking_btn_" + taskId);
        let loaderForSendBtn = $("#ads_loader_" + taskId);
        $.ajax({
            url: originalDomain + '/ajax/earnings/ajax-youtube-external.php', type: 'POST',
            data: {hash: hash, task_id: taskId, report_id: reportId, video_id: videoId, timer: timer},
            dataType: 'json',
            beforeSend: function () {
                loaderForSendBtn.css({'display': ''});
                $("#ads_btn_confirm_" + taskId).css({"display": "none"});
            },

            error: function (data) {
                errorElem.html(data.html);
                sendConfirmBtn = false;
                btnCheckingBlock.css({"display": ""});
                loaderForSendBtn.css({'display': 'none'});
            },
            success: function (data) {
                loaderForSendBtn.css({'display': 'none'});
                if (data.error) {
                    errorBtnView.css({"display": ""});
                    $("#ads_btn_confirm_" + taskId).css({"display": "none"});
                    sendConfirmBtn = false;
                    eval(data.code)
                } else {
                    sendConfirmBtn = false;
                    btnCheckingBlock.css({"display": "none"});
                    successText.css({"display": ""});
                    successText.html(`<div style="text-align:center; padding-top:3px; color:green;">${data.html}</div>`);
                    $('#ads-link-' + taskId).attr('data-status', 'inactive');
                    changeIconAndStyleAds(taskId);
                }
            }
        });
    }

};

allFunc['refuse_to_execute'] = function (taskId) {
    let reportId = $("#ads_report_id_" + taskId).val();
    $.ajax({
        url: '/ajax/earnings/ajax-youtube.php', type: 'POST',
        data: {func: "refuse_to_execute", report_id: reportId, task_id: taskId},
        dataType: 'json',
        error: function (data) {
        },
        success: function (data) {
            $("#ads-link-" + taskId).css({"display": "none"});
            removeTimer('ads_' + taskId);
            eval(data.code)
        }
    });
}


allFunc['start_youtube_new'] = function (id = '', timer = 0, url = '', checkCookie = true) {
    window.startBDScan.init();

    idTaskYoutube = id;
    let timeReloadPage = 1000 * 60 * 45;
    let reloadPage = ((new Date().getTime() - startDateLoadPage) > timeReloadPage)

    if (reloadPage) {
        error_start('<span class=\"msg-error\">Задачи устарели, обновите страницу.</span>', '#error-footer', 3000);
        $("#start-ads-" + id).html('<div class="youtube-button"><span class="status-link-youtube" onclick="window.location.reload(); return false;">Обновить страницу </span></div>');
        return false;
    }

    let iconElement = document.querySelector('.ads_' + id).querySelector('.iconyoutube')
    let idElem = document.querySelector('#link_ads_start_' + id);
    idElem.classList.add('decorationAds');
    iconElement.classList.remove('ybprosm');
    iconElement.classList.add('ybprosm_grey');

    $('#ads-link-' + id).attr('data-status', 'active');
    let checkCookieForShowPopUp = (checkCookie) ? '&show_popup_for_cookie=yes' : '';

    let targetUrl = '/go/create-task-view.php?id=' + id + url + checkCookieForShowPopUp
    let newWindow = window.open(targetUrl);
    setIntNotClear['count_down_timer'](10);

    (function checkWindow() {
        if (newWindow.closed === false) setTimeout(checkWindow, 100);
        else {
            $('#ads-link-' + id).attr('data-status', 'inactive');
            clearInterval(setIntNotClear['timerWin']);
            startTimeCampaign = 0;
            funcjs["reset_yt"]();
        }
    })();
}

function changeIconAndStyleAds(id) {
    let iconElement = document.querySelector('.ads_' + id).querySelector('.iconyoutube');
    iconElement.classList.remove('ybprosm_grey');
    iconElement.classList.add('ybprosm');
}


function changeIconAndStyleAdsClosePopUp() {
    changeIconAndStyleAds(idTaskYoutube);
    let idElem = document.querySelector('#link_ads_start_' + idTaskYoutube);
    idElem.classList.remove('decorationAds');
}

document.addEventListener('closePopUp', function () {
    changeIconAndStyleAdsClosePopUp();
});

function openModalForDoubleView(idCampaigns, timer) {
    popup_w('Вы уже выполняете задачу', false, 550, 'func=alert_double_views_youtube&campaign_id=' + idCampaigns + '&timer=' + timer, 'ajax/earnings/pop-up-earnings.php');
}

function reOpenTask(idCampaigns, timer) {
    $('#load,#popup').css('display', 'none');
    $('.modal-wrapper').remove();
    $('body').removeClass('no-scroll');
    funcjs['start_youtube_new'](idCampaigns, timer, '&reopen_double=1');
}

function startTimerIfStartedCampaign() {
    if (startTimeCampaign > 0 && startTimeCampaign < 10) {
        setActive(true);
        setIntNotClear['count_down_timer'](10 - startTimeCampaign);
    }
}

startTimerIfStartedCampaign();
1
