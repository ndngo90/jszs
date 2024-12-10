var allFunc = []
var confirmBtn = false
function changeIconAndStyleAds(id) {
    let iconElement = document.querySelector('.ads_' + id).querySelector('.iconyoutube');
    iconElement.classList.remove('ybprosm_grey');
    iconElement.classList.add('ybprosm');
}
allFunc['viewCheckDirect'] = function (taskId) {
    if (!confirmBtn) {
        confirmBtn = true;
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
                confirmBtn = false;
                btnCheckingBlock.css({"display": ""});
                loaderForSendBtn.css({'display': 'none'});
            },
            success: function (data) {
                loaderForSendBtn.css({'display': 'none'});
                if (data.error) {
                    errorBtnView.css({"display": ""});
                    $("#ads_btn_confirm_" + taskId).css({"display": "none"});
                    confirmBtn = false;
                    eval(data.code)
                } else {
                    confirmBtn = false;
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
