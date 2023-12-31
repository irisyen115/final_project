// delete.js
$(document).ready(function() {
    // 使用 jQuery 發送 GET 請求獲取相片資訊
    $.get("/api/photos", function(data) {
        // 在頁面上動態生成相片和資訊前先清空之前的內容
        const galleryContainer = $("#photo-gallery");
        galleryContainer.empty();

        // 循環內部的 Bootstrap 行
        data.forEach(photo => {
            const photoDiv = $("<div class='col-md-3 mb-3 photo'>");
            const imageHtml = `<div>
                                <div class='text-center' style='padding:10px'>
                                    <h5 class='card-title'>${photo.name}</h5>
                                </div>
                                <img class='card-img-top' src="data:image/jpg;base64,${photo.image}" alt="${photo.name}">
                                <div>
                                    <p class='card-text text-center'>關於圖片的描述或其他相關文字</p>
                                </div>
                                </div>`;
            const deleteIcon = $("<div class='delete-icon'>&times;</div>");

            // 將刪除圖示隱藏，只有在滑過圖片時才顯示
            deleteIcon.hide();

            // 在圖片容器內添加刪除圖示
            photoDiv.html(imageHtml);
            photoDiv.append(deleteIcon);

            // 綁定滑鼠事件，控制刪除圖示的顯示和點擊事件
            photoDiv.hover(
                function() {
                    // 滑過圖片時顯示刪除圖示
                    deleteIcon.show();
                },
                function() {
                    // 離開圖片時隱藏刪除圖示
                    deleteIcon.hide();
                });
            
            deleteIcon.click(function() {
                // 在這裡觸發刪除圖片的後端處理
                // 可以使用 Ajax 向 Flask 後端發送刪除請求
                // 並在成功後刪除 DOM 元素
                $.ajax({
                    url: "/api/delete_photo",
                    method: "DELETE",
                    data: { photo_id: photo.ID },  // 使用 photo.ID 作為圖片的 ID
                    success: function(response) {
                        if (response.success) {
                            // 刪除成功，從 DOM 中刪除圖片元素
                            photoDiv.remove();
                        } else {
                            // 刪除失敗，可能顯示錯誤消息
                            console.error(response.message);
                        }
                    },
                    error: function(error) {
                        console.error("刪除請求失敗", error);
                    }
                });
            });

            // 將整個圖片容器添加到畫廊容器中
            galleryContainer.append(photoDiv);
        });
    });
});
