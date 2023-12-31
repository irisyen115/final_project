// 函數用於動態生成並添加圖片元素到畫廊容器
function addPhotoToGallery(photo) {
    const galleryContainer = $("#photo-gallery");

    // 創建圖片容器，使用 Bootstrap 的 card 類別
    const photoDiv = $(`<div class='col-md-3 mb-3 photo'>
                          <div>
                          <h5 class='card-title'>${photo.name}</h5>
                          </div>
                          <div>
                            <img src="data:image/jpg;base64,${photo.image}" alt="${photo.name}">
                            <div>
                              <p class='card-text'>${photo.description}</p>
                            </div>
                          </div>
                        </div>`);

    // 將整個圖片容器添加到畫廊容器中
    galleryContainer.prepend(photoDiv);
}

// 函數用於初始化相片畫廊
function initializeGallery() {
    // 使用 jQuery 發送 GET 請求獲取相片資訊
    $.get("/api/photos", function(data) {
        // 在頁面上動態生成相片和資訊前先清空之前的內容
        const galleryContainer = $("#photo-gallery");
        galleryContainer.empty();

        // 循環內部的 Bootstrap 行
        data.forEach(photo => {
            // 動態生成圖片元素並添加到畫廊容器中
            addPhotoToGallery(photo);
        });
    });
}

$(document).ready(function() {
    // 初始化相片畫廊
    initializeGallery();

    // 上傳按鈕點擊事件
    $("#uploadButton").click(function() {
        const fileInput = $("#fileInput")[0];
        const fileNameInput = $("#fileName").val();
        const fileDescriptionInput = $("#fileDescription").val();

        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append("file", fileInput.files[0]);
            formData.append("name", fileNameInput);
            formData.append("description", fileDescriptionInput);

            // 使用 AJAX 上傳文件
            $.ajax({
                url: "/api/upload_photo",
                method: "POST",
                data: formData,
                contentType: false,
                processData: false,
                success: function(response) {
                    // 上傳成功，重新初始化相片畫廊
                    initializeGallery();
                },
                error: function(error) {
                    console.error("上傳失敗", error);
                }
            });
        } else {
            alert("請選擇要上傳的文件");
        }
    });
});
