import * as flsFunction from "./modules/functions.js"
import { useDynamicAdapt } from './files/dynamic_adapt.js'

flsFunction.isWebp()
useDynamicAdapt()

window.onload = function() {
    document.addEventListener('click', documentActions)

    function documentActions(e) {
        const targetElement = e.target;

        if(window.innerWidth > 768) {
            if(targetElement.classList.contains('menu__arrow')) {
                targetElement.closest('.menu__item').classList.toggle('_hover')
            }

            if(!targetElement.closest('.menu__item') && document.querySelectorAll('.menu__item._hover').length > 0) {
                removeClasses(document.querySelectorAll('.menu__item._hover'), '_hover')
            }
        }
        if(targetElement.classList.contains('search-form__icon')) {
            document.querySelector(".search-form").classList.toggle('_active')
        } else if(!targetElement.classList.contains('.search-form') && document.querySelector('.search-form._active')) {
            document.querySelector('.search-form').classList.remove('_active')
        }
        if(targetElement.classList.contains('icon-menu')) {
            console.log("ok");
            document.querySelector('.menu__body').classList.toggle('_active')
        }

        if(targetElement.classList.contains("products__more")) {
            getProducts(targetElement)
            e.preventDefault()
        }

        if(targetElement.classList.contains('actions-product__button')) {
            const productId = targetElement.closest('.item-product').dataset.pid;
            addToCart(targetElement, productId)
            e.preventDefault()
        }

        if(targetElement.classList.contains('cart-header__icon') || targetElement.closest('.cart-header__icon')) {
            if(document.querySelector('.cart-list').children.length > 0) {
                document.querySelector(".cart-header").classList.toggle("_active")
            }
            e.preventDefault()
        } else if(!targetElement.closest('.cart-header') && !targetElement.classList.contains('actions-product__button')) {
            document.querySelector('.cart-header').classList.remove('_active')
        }

        if(targetElement.classList.contains('cart-list__delete')) {
            const productId = targetElement.closest('.cart-list__item').dataset.cartPid;
            updateCart(targetElement, productId, false)
            e.preventDefault()
        }
    }

    //Header
    const headerElement = document.querySelector('.header')

    const callback = function (entries, observer) {
        if(entries[0].isIntersecting) {
            headerElement.classList.remove('_scroll')
        } else {
            headerElement.classList.add('_scroll')
        }
    }

    const headerObserver = new IntersectionObserver(callback)
    headerObserver.observe(headerElement)


    lightGallery(document.querySelector('.furniture__items .furniture__column .row-furniture_center'))
    lightGallery(document.querySelector('.furniture__items .furniture__column .row-furniture_right-top'))
    lightGallery(document.querySelector('.furniture__items .furniture__column .row-furniture_right-bottom'))
    lightGallery(document.querySelector('.furniture__items .furniture__column .row-furniture_left-top'))
    lightGallery(document.querySelector('.furniture__items .furniture__column .row-furniture_left-bottom'))

    //Двидени полотна при движении мышки на нем
    const furniture = document.querySelector(".furniture__body")
    if(furniture) {
        const furnitureItems = document.querySelector(".furniture__items")
        const furnitureColumn = document.querySelectorAll(".furniture__column")

        //Скорость анимации
        const speed = furniture.dataset.speed;

        //Обьявление переменной
        let positionX = 0
        let coordXprocent = 0

        function setMouseGaleryStyle() {
            let furnitureItemsWidth = 0;
            furnitureColumn.forEach(item => {
                furnitureItemsWidth += item.offsetWidth;
            })

            const furnitureDifferent = furnitureItemsWidth - furniture.offsetWidth;
            const distx = Math.floor(coordXprocent - positionX)

            positionX = positionX + (distx * speed)
            let position = furnitureDifferent / 200 * positionX

            furnitureItems.style.cssText = `transform: translate3d(${-position}px,0,0)`

            if(Math.abs(distx) > 0) {
                requestAnimationFrame(setMouseGaleryStyle)
            } else {
                furniture.classList.remove("_init")
            }
        }

        furniture.addEventListener("mousemove", function(e) {
            //Получение ширины
            const furnitureWidth = furniture.offsetHeight;

            //Ноль по середине
            const coordX = e.pageX - furnitureWidth / 2;

            //Получаем проценты
            coordXprocent = coordX / furnitureWidth * 200;

            if(!furniture.classList.contains("_init")) {
                requestAnimationFrame(setMouseGaleryStyle)
                furniture.classList.add("_init")
            }
        })
    }

}

function removeClasses(arr, remClass) {
    arr.forEach(item => {
        item.classList.remove(remClass)
    })
}

async function getProducts(button) {
    if(!button.classList.contains("_hold")) {
        button.classList.add('_hold')
        const file = 'json/products.json'
        let response = await fetch(file, {
            method: "GET"
        });
        if(response.ok) {
            let result = await response.json()
            loadProducts(result)
            button.classList.remove('_hold')
            button.remove()
        } else {
            alert('Ошибка')
        }
    }
}

function loadProducts(data) {
    const productsItems = document.querySelector(".products__items")

    data?.products.forEach(item => {
        const productId = item.id;
        const productUrl = item.url;
        const productImage = item.image;
        const productTitle = item.title;
        const productText = item.text;
        const productPrice = item.price;
        const productOldPrice = item.priceOld;
        const productShareUrl = item.shareUrl;
        const productLikeUrl = item.likeUrl;
        const productLabels = item.labels;

        let allLabest = '';

        if(productLabels) {
            productLabels.forEach(label => {
                allLabest += `<div class="item-product__label item-product__label_${label.type}">${label.value}</div>`
            })
        }

        const productTemplate = `
            <article data-pid="${productId}" class="products__item item-product">
                <div class="item-product__labels">
                    ${allLabest}
                </div>
                <a href="${productUrl}" class="item-product__image _ibg">
                    <img src="img/products/${productImage}" alt="${productTitle}">
                </a>
                <div class="item-product__body">
                    <div class="item-product__content">
                        <h5 class="item-product__title">${productTitle}</h5>
                        <div class="item-product__text">${productText}</div>
                    </div>
                    <div class="item-product__prices">
                        <div class="item-product__price">${productPrice}</div>
                        <div class="item-product__price item-product__price_old">${!!productOldPrice ? productOldPrice : ""}</div>
                    </div>
                    <div class="item-product__actions actions-product">
                        <div class="actions-product__body">
                            <a href="" class="actions-product__button btn btn_white">Add to cart</a>
                            <a href="${productShareUrl}" class="actions-product__link fa fa-share-nodes">Share</a>
                            <a href="${productLikeUrl}" class="actions-product__link fa-solid fa-heart">Like</a>
                        </div>
                    </div>
                </div>
            </article>
        `
        productsItems.insertAdjacentHTML('beforeend', productTemplate)
    })
}

function addToCart(productButton, productId) {
    if(!productButton.classList.contains('_hold')) {
        productButton.classList.add("_hold")
        productButton.classList.add("_fly")

        const cart = document.querySelector(".cart-header__icon")
        const product = document.querySelector(`[data-pid="${productId}"]`);
        const productImage = product.querySelector('.item-product__image')

        const productImageFly = productImage.cloneNode(true)

        const productImageFlyWidth = productImage.offsetWidth;
        const productImageFlyHeight = productImage.offsetHeight;
        const productImageFlyTop = productImage.getBoundingClientRect().top;
        const productImageFlyLeft = productImage.getBoundingClientRect().left;

        productImageFly.setAttribute("class", '_flyImage _ibg');

        productImageFly.style.cssText = `
            top: ${productImageFlyTop}px;
            left: ${productImageFlyLeft}px;
            width: ${productImageFlyWidth}px;
            height: ${productImageFlyHeight}px;
        `
        document.body.append(productImageFly)

        const cartTop = cart.getBoundingClientRect().top;
        const cartLeft = cart.getBoundingClientRect().left;

        productImageFly.style.cssText = `
            top: ${cartTop}px;
            left: ${cartLeft}px;
            width: 0;
            height: 0;
            opacity: 0;
        `

        productImageFly.addEventListener('transitionend', function() {
            if(productButton.classList.contains('_fly')) {
                productImageFly.remove()
                updateCart(productButton, productId)
                productButton.classList.remove("_fly")
            }
        })
    }
}

function updateCart(productButton, productId, productAdd = true) {
    const cart = document.querySelector('.cart-header')
    const cartIcon = document.querySelector('.cart-header__icon')
    const cartQuantity = cartIcon.querySelector('span')
    const cartProduct = document.querySelector(`[data-cart-pid="${productId}"]`)
    const cartList = document.querySelector('.cart-list')

    //добавляем
    if(productAdd) {
        if(cartQuantity) {
            cartQuantity.innerHTML = ++cartQuantity.innerHTML;
        } else {
            cartIcon.insertAdjacentHTML("beforeend", '<span>1</span>')
        }

         if(!cartProduct) {
            const product = document.querySelector(`[data-pid="${productId}"]`)
            const cartProductImage = product.querySelector('.item-product__image').innerHTML
            const cartProductTitle = product.querySelector('.item-product__title').innerHTML
            const cartProductContent = `
                <a href="" class="cart-list__image _ibg">${cartProductImage}</a>
                <div class="cart-list__body">
                    <a href="" class="cart-list__title">${cartProductTitle}</a>
                    <div class="cart-list__quantity">Quantity: <span>1</span></div>
                    <a href="" class="cart-list__delete">Delete</a>
                </div>
            `
            cartList.insertAdjacentHTML("beforeend", `<li data-cart-pid="${productId}" class="cart-list__item">${cartProductContent}</li>`)
        } else {
            const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span')
            cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML
        }

        productButton.classList.remove('_hold')
    } else {
        const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span')
        cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML;

        if(!parseInt(cartProductQuantity.innerHTML)) {
            cartProduct.remove();
        }

        const cartQuantityValue = --cartQuantity.innerHTML;

        if(cartQuantityValue) {
            cartQuantity.innerHTML = cartQuantityValue
        } else {
            cartQuantity.remove()
            cart.classList.remove('_active')
        }
    }

}

if(document.querySelector('.slider-main__body')) {
    new Swiper('.slider-main__body', {
        // effect: 'coverflow',
        slidesPerView: 'auto',
        centeredSlides: true,
        observer: true,
        observeParents: true,
        // slidesPerView: 1,
        spaceBetween: 32,
        watchOverflow: true,
        speed: 800,
        loop: "infinite",
        loopAdditionalSlides: 5,
        preloadImages: false,
        parallax: true,

        pagination: {
            el: '.controls-slider-main__dotts',
            clickable: true
        },

        navigation: {
            nextEl: '.slider-main .slider-arrow_prev',
            prevEl: '.slider-main .slider-arrow_next'
        }
    });
}

if(document.querySelector('.slider-rooms__body')) {
    new Swiper('.slider-rooms__body', {
        // centeredSlides: true,
        observer: true,
        observeParents: true,
        slidesPerView: "auto",
        spaceBetween: 24,
        watchOverflow: true,
        speed: 800,
        loop: true,
        loopAdditionalSlides: 5,
        preloadImages: false,
        parallax: true,

        pagination: {
            el: '.slider-rooms__dotts',
            clickable: true
        },

        navigation: {
            nextEl: '.slider-rooms .slider-arrow_prev',
            prevEl: '.slider-rooms .slider-arrow_next'
        }
    });
}

if(document.querySelector('.slider-tips__body')) {
    new Swiper('.slider-tips__body', {
        // centeredSlides: true,
        observer: true,
        observeParents: true,
        slidesPerView: 3,
        spaceBetween: 32,
        watchOverflow: true,
        speed: 800,
        // loop: true,

        pagination: {
            el: '.slider-tips__dotts',
            clickable: true
        },

        navigation: {
            nextEl: '.slider-tips .slider-arrow_prev',
            prevEl: '.slider-tips .slider-arrow_next'
        },
        breakpoints: {
            320: {
                slidesPerView: 1.1,
                spaceBetween: 15
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            992: {
                slidesPerView: 3,
                spaceBetween: 32
            }
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////


// window.onload = function() {
//     document.addEventListener('click', documentActions)

//     function documentActions(e) {
//         const targetElement = e.target;
//         if(window.innerWidth > 768) {
//             if(targetElement.classList.contains('menu__arrow')) {
//                 targetElement.closest('.menu__item').classList.toggle('_hover')
//             }
//         }
//     }
// }

const spollersArray = document.querySelectorAll('[data-spollers]')

if(spollersArray.length > 0) {
    //Получение обычных спойлеров
    const spollersRegular = Array.from(spollersArray).filter(function(item, index, self) {
        return !item.dataset.spollers.split(",")[0]
    })

    //Инициализация обычных спойлеров
    if(spollersRegular.length > 0) {
        initSpollers(spollersRegular)
    }

    //Получение спойлеров с медиа запросами
    const spollersMedia = Array.from(spollersArray).filter(function(item, index, self) {
        return item.dataset.spollers.split(",")[0]
    })

    //Инициализаци спойлеров с медиа запросами
    if(spollersMedia.length > 0) {
        const breakpointsArray = []
        spollersMedia.forEach(item => {
            const params = item.dataset.spollers;
            const breakpoint = {};
            const paramsArray = params.split(",");
            breakpoint.value = paramsArray[0];
            breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max"
            breakpoint.item = item
            breakpointsArray.push(breakpoint)
        })

        //Получение уникальных бекпоинтов
        let mediaQueries =  breakpointsArray.map(function(item) {
            return '(' + item.type + "-width: " + item.value + "px)," + item.value + "," + item.type;
        })
        mediaQueries = mediaQueries.filter(function(item, index, self) {
            return self.indexOf(item) === index
        })

        // Работаем с каждым брекпоинтом
        mediaQueries.forEach(breakpoint => {
            const paramsArray = breakpoint.split(",");
            console.log('paramsArray', paramsArray[1]);
            const mediaBreakpoint = paramsArray[1]
            const mediaType = paramsArray[2]
            const matchMedia = window.matchMedia(paramsArray[0]);

            //Обьекты с нужными условиями
            const spollersArray = breakpointsArray.filter(function(item) {
                if(item.value === mediaBreakpoint && item.type === mediaType) {
                    return true
                }
            }) 
            //Событие
            matchMedia.addListener(function() {
                initSpollers(spollersArray, matchMedia);
            })
            initSpollers(spollersArray, matchMedia);
        })
    }

    //Инициализация 
    function initSpollers(spollersArray, matchMedia = false) {
        spollersArray.forEach(spollersBlock => {
            spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
            if(matchMedia.matches || !matchMedia) {
                spollersBlock.classList.add("_init");
                initSpollerBody(spollersBlock)
                spollersBlock.addEventListener("click", setSpollerAction)
            } else {
                spollersBlock.classList.remove("_init")
                initSpollerBody(spollersBlock, false);
                spollersBlock.removeEventListener("click", setSpollerAction)
            }
        })
    }

    //Работа с контентом
    function initSpollerBody(spollersBlock, hideSpollerBody = true) {
        const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]')
        if(spollerTitles.length > 0) {
            spollerTitles.forEach(spollerTitle => {
                if(hideSpollerBody) {
                    spollerTitle.removeAttribute('tabindex')
                    if (!spollerTitle.classList.contains('_active')) {
                        spollerTitle.nextElemenSibling.hidden = true;
                    }
                } else {
                    spollerTitle.setAttribute('tabindex','-1');
                    spollerTitle.nextElemenSibling.hidden = false
                }
            })
        }
    }

    function setSpollerAction(e) {
        const el = e.target;
        if(el.hasAttribute('data-spoller') || el.closest('[data-spoller]')) {
            const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]')
            const spollersBlock = spollerTitle.closest('[data-spollers]')
            const oneSpoller = spollersBlock.hasAttribute('data-one-apoller') ? true : false;
            if(!spollersBlock.querySelectorAll(".slide").length) {
                if(oneSpoller && !spollerTitle.classList.contains("_active")) {
                    hideSpollerBody(spollersBlock)
                }
                spollerTitle.classList.toggle("_active")
                _slideToggle(spollerTitle.nextElemenSibling, 500)
            }
            e.preventDefault()
        }
    }
    function hideSpollerBody(spollersBlock) {
        const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._active')
        if(spollerActiveTitle) {
            spollerActiveTitle.classList.remove('_active');
            _sliderUp(spollerActiveTitle.nextElemenSibling, 500)
        }
    }
}

let _slideUp = (target, duration = 500) => {
    if(!target.classList.contains('_slide')) {
        target.classList.add('_slide')
        target.style.transitionProperty = 'height, margin, padding'
        target.style.transitionDuration = duration + 'ms'
        target.style.height = target.offsetHeight + 'px'
        target.offsetHeight
        target.style.overflow = 'hidden'
        target.style.height = 0
        target.style.paddingTop = 0
        target.style.paddingBottom = 0
        target.style.marginTop = 0
        target.style.marginBottom = 0
        window.setTimeout(() => {
            target.hidden = true
            target.style.removeProperty('height')
            target.style.removeProperty('padding-top')
            target.style.removeProperty('padding-bottom')
            target.style.removeProperty('margin-top')
            target.style.removeProperty('margin-bottom')
            target.style.removeProperty('overflow')
            target.style.removeProperty('transition-duration')
            target.style.removeProperty('transition-property')
            target.classList.remove('_slide');
        }, duration)
    }
}

let _slideDown = (target, duration = 500) => {
    if(!target.classList.contains('_slide')) {
        target.classList.add('_slide')
        if(target.hidden) {
            target.hidden = false
        }
        let height = target.offsetHeight
        target.style.overflow = 'hidden'
        target.style.height = 0
        target.style.paddingTop = 0
        target.style.paddingBottom = 0
        target.style.marginTop = 0
        target.style.marginBottom = 0
        target.offsetHeight
        target.style.transitionProperty = 'height, margin, padding'
        target.style.transitionDuration = duration + 'ms'
        target.style.height = height + 'px'
        target.style.removeProperty('padding-top')
        target.style.removeProperty('padding-bottom')
        target.style.removeProperty('margin-top')
        target.style.removeProperty('margin-bottom')
        window.setTimeout(() => {
            target.style.removeProperty('height')
            target.style.removeProperty('overflow')
            target.style.removeProperty('transition-duration')
            target.style.removeProperty('transition-property')
            target.classList.remove('_slide');
        }, duration)
    }
}

let _slideToggle = (target, duration = 500) => {
    if(target.hidden) {
        return _slideDown(target, duration)
    } else {
        return _slideUp(target, duration)
    }
}
