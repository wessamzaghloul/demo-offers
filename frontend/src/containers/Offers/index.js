import React, { Component } from "react";
import OffersList from "../../components/OffersList";
import Loader from "../../components/Loader";

import axios from "axios";

const url = "http://localhost:9999/api/offer/par_nxvjj7em";
class Offers extends Component {
    state = {
        offers: [],
        isLoading: true,
        errors: null
    };
    componentDidMount() {
        this.getoffers();
    }

    async getoffers() {
        const response = await axios.get(url);
        try {
            this.setState({
                offers: response.data.offers,
                isLoading: false
            });
        } catch (error) {
            this.setState({ error, isLoading: false });
        }
    }

    async postOfferAccepted(customerId) {
        this.setState({ isLoading: true });
        const response = await axios.post(url, {
            customer_id: customerId
        });

        try {
            const offers = this.state.offers;

            let updatedOffers = offers.map((offer, index) => {
                if (offer.customer_id === response.data.customer_id) {
                    offer = response.data;
                    return offer;
                }
                return offer;
            });
            this.setState({ offers: updatedOffers, isLoading: false });
        } catch (error) {
            this.setState({ error, isLoading: false });
        }
    }

    getPendingOffers() {
        let pendingOffers = this.state.offers.filter(
            offer => offer.status === "new"
        );
        return pendingOffers;
    }
    getAcceptedOffers() {
        let acceptedOffers = this.state.offers.filter(
            offer => offer.status === "accepted"
        );
        return acceptedOffers;
    }

    render() {
        const { isLoading } = this.state;
        return (
            <section className="component component-offers">
                {isLoading ? <Loader /> : ""}
                <h1 className="page-title">Offers</h1>
                <h6 className="page-subtitle">New Offers</h6>

                <OffersList
                    hasAction={true}
                    offers={this.getPendingOffers()}
                    handleClick={this.postOfferAccepted.bind(this)}
                />

                <h6 className="page-subtitle">Accepted Offers</h6>

                <OffersList
                    hasAction={false}
                    offers={this.getAcceptedOffers()}
                    handleClick={this.postOfferAccepted.bind(this)}
                />
            </section>
        );
    }
}

export default Offers;
