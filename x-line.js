(function ($) {
    // 存储当前连线数据
    let connectionData = [];
    // 存储连线元素和对应的线条元素
    const connectionMap = new Map();
    // 连线模式标志
    let isConnecting = false;
    // 当前选中的起始元素
    let currentStartElement = null;
    // 背景 div
    let overlayDiv = null;
    // 存储回调函数
    let xLineCallback = null;

    /**
     * 检查元素是否已有连线（用于 .x-line-one）
     * @param {HTMLElement} element - 要检查的元素
     * @returns {boolean} 是否有连线
     */
    function hasConnectionForOne(element) {
        return $(element).data('line').length > 0;
    }

    /**
     * 初始化注册起始和结束元素
     */
    function init() {
        // 初始化所有元素的连线数据
        $('.x-line-start, .x-line-end').each(function () {
            if (!validateElement(this)) return;
            $(this).data('line', []);
        });

        // 注册起始元素
        $('.x-line-start').each(function () {
            if (!validateElement(this)) return;

            if ($(this).hasClass('x-line-one')) {
                if (hasConnection(this)) {
                    $(this).on('click', showTips);
                    $(this).on('dblclick', confirmDeleteConnection);
                } else {
                    $(this).on('click', startConnection);
                }
            } else {
                $(this).on('click', startConnection);
            }
        });

        // 注册结束元素
        $('.x-line-end').each(function () {
            if (!validateElement(this)) return;

            if (!$(this).hasClass('x-line-one') || !hasConnectionForOne(this)) {
                $(this).on('click', endConnection);
            }
        });
    }

    /**
     * 验证元素是否有 data-id
     * @param {HTMLElement} element - 要验证的元素
     * @returns {boolean} 是否有效
     */
    function validateElement(element) {
        if (!$(element).attr('data-id')) {
            $(element).attr('title', '未配置data-id的元素不可连线');
            return false;
        }
        return true;
    }

    /**
     * 检查元素是否已有连线
     * @param {HTMLElement} element - 要检查的元素
     * @returns {boolean} 是否有连线
     */
    function hasConnection(element) {
        return $(element).data('line').length > 0;
    }

    /**
     * 显示提示信息
     * @param {Event} e - 点击事件
     */
    function showTips(e) {
        e.stopPropagation();
        layer.tips('已有连线，需要重新连线请双击删除后再连', e.target);
    }

    /**
     * 确认删除连线
     * @param {Event} e - 双击事件
     */
    function confirmDeleteConnection(e) {
        e.stopPropagation();
        layer.confirm('是否清空当前连线？', function (index) {
            const id = $(this).attr('data-id');
            deleteConnectionsByElementId(id);
            layer.close(index);
        });
    }

    /**
     * 开始连线模式
     * @param {Event} e - 点击事件
     */
    function startConnection(e) {
        const startElement = this;

        if (isConnecting && hasConnection(startElement)) {
            layer.confirm('是否清空当前连线？', { zIndex: 2025071710 }, function (index) {
                const id = $(startElement).attr('data-id');
                deleteConnectionsByElementId(id);
                cancelConnection(new Event('contextmenu'));
                layer.close(index);
            });
            return;
        }
        
        // 绑定ESC键事件
        $(document).on('keydown.xline', function(e) {
            if (e.key === 'Escape') {
                cancelConnection(new Event('keydown'));
            }
        });
        if ($(startElement).hasClass('x-line-one') && hasConnection(startElement)) {
            if (isConnecting) {
                layer.confirm('是否清空当前连线？', function (index) {
                    const id = $(startElement).attr('data-id');
                    deleteConnectionsByElementId(id);
                    cancelConnection(new Event('contextmenu'));
                    layer.close(index);
                });
            } else {
                layer.confirm('当前已有连线，是否立刻删除连线？', function (index) {
                    const id = $(startElement).attr('data-id');
                    deleteConnectionsByElementId(id);
                    layer.close(index);
                });
            }
            return;
        }

        e.stopPropagation();
        currentStartElement = startElement;

        // 创建背景 div
        if (!overlayDiv) {
            overlayDiv = $('<div>');
            overlayDiv.css({
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'white',
                opacity: '0.6',
                zIndex: '20250717',
                pointerEvents: 'none',
                overflow: 'auto'
            });
            $('body').append(overlayDiv);

            // 设置右键取消连线模式
            overlayDiv.on('contextmenu', cancelConnection);
        }

        // 设置起始元素和结束元素的 z-index
        $(currentStartElement).css('z-index', '2025071701');
        $('.x-line-end').each(function () {
            // 排除已连接的end元素
            const isConnected = $(currentStartElement).data('line').includes($(this).attr('data-id')) ||
                $(this).data('line').includes($(currentStartElement).attr('data-id'));
            if (!isConnected && (!$(this).hasClass('x-line-one') || !hasConnection(this))) {
                $(this).css('z-index', '2025071701');
            }
        });

        isConnecting = true;
    }

    /**
     * 取消连线模式
     * @param {Event} e - 右键事件
     */
    function cancelConnection(e) {
        e.preventDefault();
        removeOverlay();
        resetZIndex();
        isConnecting = false;
        currentStartElement = null;
        overlayDiv = null;
        // 移除ESC键事件
        $(document).off('keydown.xline');
    }

    /**
     * 移除背景 div
     */
    function removeOverlay() {
        if (overlayDiv) {
            overlayDiv.remove();
        }
    }

    /**
     * 重置元素的 z-index
     */
    function resetZIndex() {
        if (currentStartElement) {
            $(currentStartElement).css('z-index', '0');
        }
        $('.x-line-end').css('z-index', '0');
    }

    /**
     * 结束连线，创建连线元素
     * @param {Event} e - 点击事件
     */
    function endConnection(e) {
        if (!isConnecting) {
            if (hasConnection(this)) {
                layer.confirm('是否清空当前连线？', index => {
                    const id = $(this).data('id');
                    deleteConnectionsByElementId(id);
                    layer.close(index);
                });
                return;
            }
            return;
        }
        e.stopPropagation();

        const endElement = this;
        if (!$(endElement).hasClass('x-line-one') || !hasConnectionForOne(endElement)) {
            if (createConnection(currentStartElement, endElement) !== false)
                cancelConnection(new Event('contextmenu'));
        }
    }

    /**
     * 创建连线元素
     * @param {HTMLElement} startElement - 起始元素
     * @param {HTMLElement} endElement - 结束元素
     */
    function createConnection(startElement, endElement) {
        const startId = $(startElement).attr('data-id');
        const endId = $(endElement).attr('data-id');

        // 检查是否已存在相同连接
        if ($(startElement).data('line').includes(endId) ||
            $(endElement).data('line').includes(startId)) {
            return false;
        }

        // 创建连线数据
        const connection = { s: startId, e: endId };
        connectionData.push(connection);

        // 更新元素的连线数据
        $(startElement).data('line', [...$(startElement).data('line'), endId]);
        $(endElement).data('line', [startId]);
        $(startElement).data('line', [endId]);

        // 创建连线元素
        const lineDiv = $('<div>').addClass('x-line-connected');

        // 计算连线位置和样式
        const startOffset = $(startElement).offset();
        const endOffset = $(endElement).offset();
        const startWidth = $(startElement).outerWidth();
        const startHeight = $(startElement).outerHeight();
        const endWidth = $(endElement).outerWidth();
        const endHeight = $(endElement).outerHeight();

        const y_start = startOffset.top + startHeight / 2;
        const x_start = startOffset.left + startWidth / 2;
        const y_end = endOffset.top + endHeight / 2;
        const x_end = endOffset.left + endWidth / 2;

        const lx = x_end - x_start;
        const ly = y_end - y_start;
        const length = Math.sqrt(lx * lx + ly * ly);
        const c = 360 * Math.atan2(ly, lx) / (2 * Math.PI);
        const midX = (x_end + x_start) / 2;
        const midY = (y_end + y_start) / 2;
        const deg = c <= -90 ? (360 + c) : c;

        lineDiv.css({
            position: 'absolute',
            top: midY + 'px',
            left: (midX - length / 2) + 'px',
            width: length + 'px',
            transform: 'rotate(' + deg + 'deg)',
            zIndex: '2025071702'
        });
        $('body').append(lineDiv);

        // 存储连线关系
        connectionMap.set(`${startId}-${endId}`, lineDiv[0]);

        // 执行回调
        if (xLineCallback) {
            xLineCallback(connectionData);
        }
    }

    /**
     * 根据元素 ID 删除连线
     * @param {string} id - 元素的 data-id
     */
    function deleteConnectionsByElementId(id) {
        // 收集所有需要删除的连线key
        const keysToDelete = [];

        connectionData = connectionData.filter(item => {
            if (item.s === id || item.e === id) {
                const key = `${item.s}-${item.e}`;
                keysToDelete.push(key);

                // 更新元素的连线数据
                const element = $(`[data-id="${id}"]`);
                const otherElement = $(`[data-id="${item.s === id ? item.e : item.s}"]`);
                const otherId = item.s === id ? item.e : item.s;
                element.data('line', element.data('line').filter(connId => connId !== otherId));
                otherElement.data('line', otherElement.data('line').filter(connId => connId !== id));

                return false;
            }
            return true;
        });

        // 删除所有相关连线元素
        keysToDelete.forEach(key => {
            const lineDiv = connectionMap.get(key);
            if (lineDiv) {
                $(lineDiv).remove();
                connectionMap.delete(key);
            }
        });

        // 执行回调
        if (xLineCallback) {
            xLineCallback(connectionData);
        }
    }

    /**
     * 初始化渲染连线
     * @param {Array} data - 连线数据
     */
    function renderConnections(data) {
        data.forEach(item => {
            const startElement = $(`[data-id="${item.s}"]`)[0];
            const endElement = $(`[data-id="${item.e}"]`)[0];
            if (startElement && endElement) {
                createConnection(startElement, endElement);
            }
        });
        connectionData = [...data];
    }

    /**
     * 暴露 xLine 函数到 window
     * @param {Array} data - 初始化渲染连线数据
     * @param {Function} callback - 回调函数
     */
    window.xLine = function (data = [], callback) {
        if (callback) {
            xLineCallback = callback;
        }

        init();
        if (data.length > 0) {
            renderConnections(data);
        }
    };
})(layui.jquery);