package com.reversebooking.reversebooking.offer;

import java.util.List;

public record Standing(int priceRank, int totalBids, List<String> strengths, String note) {
}
