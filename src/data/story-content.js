/**
 * Story content for ThreeDModel component
 * Separated from component logic for better maintainability and i18n support
 */

export const storyFloors = [
    {
        id: 1,
        content: `<p>Di sebuah pagi yang tampak biasa, seseorang terbangun—namun dunia di sekitarnya tidak lagi terasa sama.</p>`,
        backgroundText: "AWAKENING",
        duration: 4.2,
        gap: 2.8,
    },
    {
        id: 2,
        content: `<p><strong>Namanya Aksa.</strong></p><p>Pernah, di masa silam, ia dikenal sebagai sosok yang menyala. Dalam diamnya, ada nyala tekad. Dalam langkahnya, ada arah yang selalu jelas.</p><p>Ia bukan hanya cerdas, tapi juga penuh visi. Seakan segala hal yang disentuhnya, tumbuh menjadi sesuatu yang berarti.</p>`,
        backgroundText: "AKSA",
        duration: 7.5,
        gap: 3.5,
    },
    {
        id: 3,
        content: `<p>Namun waktu… tak selalu bersahabat.</p><p>Perlahan, tanpa disadarinya, Aksa mulai berjalan tanpa arah. Bukan karena ia kehilangan tujuan, tapi karena terlalu lama membiarkan dirinya terjebak dalam kenyamanan semu.</p>`,
        backgroundText: "TIME",
        duration: 6.0,
        gap: 3.5,
    },
    {
        id: 4,
        content: `<p>Hari-harinya diisi dengan distraksi kecil yang menjelma besar. Ia menunda, menanti, lalu mengulanginya. Hari demi hari, tanpa progres. Ia tahu itu, <br><br><strong>tapi seperti lumpur, makin ia mencoba bergerak, makin dalam ia tenggelam.</strong></p>`,
        backgroundText: "STUCK",
        duration: 7.0,
        gap: 4.2,
    },
    {
        id: 5,
        content: `<p>Hingga akhirnya… datang ujian itu.</p><p>Bukan bencana besar, bukan pula kegagalan mencolok. Tapi cukup untuk menyentaknya.</p>`,
        backgroundText: "TEST",
        duration: 4.8,
        gap: 2.8,
    },
    {
        id: 6,
        content: `<p>Sebuah kesempatan besar—yang dulu akan ia taklukkan dengan mudah—kini berdiri di hadapannya, dan <br><br><strong>ia sadar: ia tidak lagi siap.</strong></p><p>Tangannya ragu, pikirannya lambat, hatinya ciut.</p>`,
        backgroundText: "REALIZE",
        duration: 6.0,
        gap: 3.5,
    },
    {
        id: 7,
        content: `<p>Saat itulah ia melihat bayangannya sendiri.</p><p>Bukan yang ada di cermin, tapi yang ada dalam ingatannya—versi dirinya yang dulu. Yang penuh bara. Yang bisa menyala kapan saja.</p><p><strong>Ia tidak ingin menjadi penonton dari hidupnya sendiri.</strong></p>`,
        backgroundText: "REFLECTION",
        duration: 7.2,
        gap: 3.8,
    },
    {
        id: 8,
        content: `<p>Perjalanan kembali dimulai. Berat. Lambat. Penuh rasa malu karena harus mengulang.</p><p>Tapi satu hal yang kini tertanam kuat di dadanya: <strong>ia masih punya nyala.</strong> Meskipun kecil, ia menyimpannya. Dan itu cukup untuk membuatnya bergerak.</p>`,
        backgroundText: "JOURNEY",
        duration: 6.2,
        gap: 3.2,
    },
    {
        id: 9,
        content: `<p>Hari ini, Aksa belum kembali menjadi dirinya yang dulu.</p><p>Tapi setiap langkahnya kini adalah <strong>pilihan sadar untuk tidak menyerah.</strong></p><p>Setiap detik, ia bertaruh pada kemungkinan bahwa dirinya masih bisa kembali menjadi sosok yang bukan hanya baik, tapi berarti.</p>`,
        backgroundText: "HOPE",
        duration: 7.5,
        gap: 4.0,
    },
];

// Animation constants with explanations
export const ANIMATION_CONFIG = {
    // Percentage of scroll progress before 3D model starts animating
    SCROLL_THRESHOLD: 0.33,

    // Base duration for text animations (in viewport heights)
    DEFAULT_DURATION: 5.0,

    // Gap between text sections (in viewport heights)
    DEFAULT_GAP: 3.2,

    // Smoothness of scroll-linked animations (lower = more controlled, higher = smoother but faster)
    SCROLL_SCRUB: 0.8,

    // Percentage of animation duration used for exit animation (0.4 = 40%)
    EXIT_DURATION_RATIO: 0.4,
};
