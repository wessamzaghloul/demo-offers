import React from "react";
import OffersListItem from "../OffersListItem";

const OffersList = ({ hasAction, offers, handleClick }) => {
    function formatCurrency(amount) {
        return String(amount).replace(".", ",");
    }
    return (
        <ul
            className={`offers-list  ${hasAction ? "offers-list__action" : ""}`}
        >
            {offers.map((offer, index) => {
                return (
                    <OffersListItem
                        key={index}
                        hasAction={hasAction}
                        id={offer.customer_id}
                        company={offer.customer_company}
                        name={offer.customer_name}
                        price={formatCurrency(offer.contract_price)}
                        scheduleMatches={offer.schedule_matches}
                        handleClick={handleClick}
                    />
                );
            })}
        </ul>
    );
};

export default OffersList;
