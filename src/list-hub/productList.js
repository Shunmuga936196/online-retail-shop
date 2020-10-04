import React from 'react';
import axios from 'axios';
import '../styles/list-hub.css';

class ProductList extends React.Component {

    state = {
        productListRes: [],
        productList: [],
        cartList: [],
        filter: 'all',
        totalCartCount: 0,
        orderSubmitted: false,
        ismob: false
    }

    componentDidMount() {
        let mob = window.innerWidth < 450;
        axios.get('https://uiexercise.onemindindia.com/api/Product')
            .then(response => {
                let updateList = [];
                let res = JSON.parse(JSON.stringify(response.data));
                for (let i = 0; i < res.length; i++) {
                    updateList.push(res[i]);
                    updateList[i]["selectedQuantity"] = 0;
                }
                this.setState({ productListRes: response.data, productList: updateList, ismob: mob });
            })
            .catch(error => {
                console.log(error);
            })
    }

    changeCount(prescItem, index, increment) {
        let prodList = this.state.productList;
        let data = prodList[index];
        data.selectedQuantity = increment ? data.selectedQuantity + 1 : data.selectedQuantity - 1;
        this.setState({ productList: prodList });
    }

    addToCart(item, index) {
        let self = this, reqObj = {
            "productName": item.productName,
            "productId": item.productId,
            "availableQuantity": item.availableQuantity
        };
        axios.post('https://uiexercise.onemindindia.com/api/OrderProducts', reqObj)
            .then(response => {
                if (response) {
                    let data = self.state.cartList;
                    data.push(JSON.parse(JSON.stringify(item)));
                    let prodList = self.state.productList;
                    prodList[index]['addedToCart'] = true;
                    self.setState({ cartList: data, productList: prodList, totalCartCount: self.state.totalCartCount + item.selectedQuantity });
                }
            })
            .catch(error => {
                console.log(error);
            })
    }

    removeFromCart(item, index) {
        let stateCartList = this.state.cartList;
        let pos = stateCartList.findIndex((cartList) => { return cartList.productId === item.productId });
        stateCartList.splice(pos, 1);
        let prodList = JSON.parse(JSON.stringify(this.state.productList));
        prodList[index]['addedToCart'] = false;
        prodList[index]["selectedQuantity"] = 0;
        this.setState({ cartList: stateCartList, productList: prodList, totalCartCount: this.state.totalCartCount - item.selectedQuantity });
    }

    submitOrder() {
        let self = this;
        this.state.cartList.forEach((item, index) => {
            let obj = {
                "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "productId": item.productId,
                "quantity": item.selectedQuantity
            }
            axios.post('https://uiexercise.onemindindia.com/api/OrderProducts', obj)
                .then(response => {
                    console.log(response);
                    if (index === (self.state.cartList.length - 1)) {
                        self.setState({ orderSubmitted: true });
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        });
    }

    bindProdList() {
        let listHTML = [], self = this;
        this.state.productList.forEach((item, index) => {
            if (this.state.filter === "available" && item.availableQuantity === 0) {
                return;
            }
            listHTML.push(
                <div key={"product-card" + index + 1} className={`product-list-card ${item.addedToCart ? "selected" : ""}`}>
                    {self.state.ismob === false && <div className="prod-image"><img src="prod.jpg" alt="Product img" width="150" /></div>}
                    <div className={`${self.state.ismob ? "prod-details-mob" : "prod-details"}`}>
                        <div>{item.productName}</div>
                        <div>Available: {item.availableQuantity}</div>
                    </div>
                    <div className="align-center">
                        {((!item.addedToCart) || (item.addedToCart === false)) &&
                            <React.Fragment>
                                <button onClick={self.addToCart.bind(this, item, index)} className={`default-btn ${self.state.ismob ? "mob-btn" : ""}`} disabled={item.selectedQuantity < 1}>{self.state.ismob ? "Add" : "Add to cart"}</button>
                                <div className="qty-counter">
                                    <button onClick={self.changeCount.bind(this, item, index, false)} disabled={item.selectedQuantity === 0} className="count-change-btn">-</button>
                                    <div className="qty-counter-count">{item.selectedQuantity || 0}</div>
                                    <button onClick={self.changeCount.bind(this, item, index, true)} disabled={item.selectedQuantity === item.availableQuantity} className="count-change-btn">+</button>
                                </div>
                            </React.Fragment>
                        }
                        {item.addedToCart &&
                            <React.Fragment>
                                <button className={`default-btn ${self.state.ismob ? "mob-btn" : ""}`} onClick={self.removeFromCart.bind(this, item, index)}>{self.state.ismob ? "Remove" : "Remove from cart"}</button>
                                <div>Qty: {item.selectedQuantity}</div>
                            </React.Fragment>
                        }
                    </div>
                </div>
            );
        });
        return listHTML;
    }

    onFilterChange(event) {
        this.setState({ filter: event.target.value });
    }

    render() {
        return (
            <React.Fragment>
                <div className="product-list-header">
                    <div className="header-container">
                        <div className="page-header">Online Retail Shop</div>
                        {this.state.orderSubmitted === false &&
                            <div className="product-filter-container">
                                {this.state.ismob === false && <label htmlFor="prodFilter">Filter:</label>}
                                <select onChange={this.onFilterChange.bind(this)} className="product-filter" name="prodFilter" id="productFilter">
                                    <option value="all">Show All</option>
                                    <option value="available">Availability</option>
                                </select>
                            </div>}
                    </div>
                </div>
                <div className={`product-list-outer-container ${this.state.totalCartCount > 0 ? "visible-footer" : ""}`}>
                    <div className="product-list-container">
                        {this.state.orderSubmitted &&
                            <div>Order Placed Successfully !!! <a href="/" onClick={() => this.setState({ orderSubmitted: false })}>Continue Shopping... </a></div>
                        }
                        {this.state.orderSubmitted === false && this.bindProdList()}
                    </div>
                </div>
                {this.state.orderSubmitted === false && this.state.totalCartCount > 0 &&
                    <div className="product-list-footer">
                        <span className="checkout-btn-container">
                            <div className="checkout-btn-count">{this.state.totalCartCount}</div>
                            <button className="checkout-btn" onClick={this.submitOrder.bind(this)}>Submit Order</button>
                        </span>
                    </div>}
            </React.Fragment>
        );
    }
}

export default ProductList;
