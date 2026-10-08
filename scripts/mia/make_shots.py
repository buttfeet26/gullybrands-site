"""Build shots.json: every Mia shot to make (studio per colourway + lifestyle per design)."""
import json, pathlib

S = pathlib.Path(__file__).parent
cat = json.load(open(S / "catalog.json"))

# How each colour is described (base top for Krea, and for the Qwen product swap)
COLOUR = {
    "White": "white", "Black": "black", "Navy Blue": "navy blue", "Grey Melange": "heather grey marl",
    "Light Baby Pink": "light baby pink", "Beige": "pale butter yellow", "Lavender": "pale lavender",
}

# Exact print descriptions so Qwen reproduces the real artwork
PRINT = {
    "spider-crop-top": "a single small black spider with long thin curved legs printed in the centre of the chest",
    "radio-silence-live-crop-top": "a black rectangular print on the chest: white bold text RADIO SILENCE / BACK IN THE USA along the top, a black-and-white halftone photo of a guitarist inside a thin white frame, and white bold text PERFORM LIVE ON STAGE underneath",
    "8-ball-trio-crop-top": "three overlapping billiard 8-balls printed on the chest: a glossy pink 8-ball at the top, a black 8-ball to its right and a leopard-print 8-ball below",
    "life-is-better-brunette-crop-top": "navy blue text printed across the chest: the words Life is better in a thin handwritten script on the first line and the word BRUNETTE in bold rounded capital letters on the second line",
    "lucky-girl-crop-top": "navy blue varsity letters printed across the chest: the word LUCKY on the first line, and GI then a navy five-point star then RL on the second line",
    "leopard-star-crop-top": "a single large five-point star filled with tan and black leopard print, printed in the centre of the chest",
    "star-girl-crop-top": "a distressed black-and-cream illustrated portrait of a girl with heavy bangs and dark eye makeup with a cracked vintage texture, with four cream stars with dark outlines to the right of her face, printed on the chest",
    "lucky-8-ball-crop-top": "a single round fuzzy black billiard 8-ball with a white circle and a black number 8 in its centre, printed in the middle of the chest",
    "circuit-de-monaco-1968-crop-top": "a red line drawing of a vintage 1960s sports coupe printed across the chest with red capital text CIRCUIT DE MONACO and 1968 underneath it",
    "national-anthem-kisses-crop-top": "dark red script text I'm your National Anthem printed across the upper chest with a scattered cluster of red lipstick kiss marks below it",
    "life-is-better-blonde-crop-top": "dusty pink text printed across the chest: the words Life is better in a thin handwritten script on the first line and the word BLONDE in bold rounded capital letters on the second line",
    "crystal-bow-crop-top": "a large sparkling silver crystal rhinestone bow printed in the centre of the chest",
}

STYLE = {
    "y2k": "styled Y2K baddie: low-rise light-wash flared jeans, chunky chrome hoop earrings, butterfly hair clips, glossy pink lips and winged eyeliner",
    "coquette": "styled coquette baddie: a low-rise white pleated mini skirt, a pink satin ribbon bow tied in her hair, a pearl choker, glossy lips and rosy blush",
    "grunge": "styled grunge it girl: low-rise black baggy cargo pants, a tight black choker worn high on the neck with no pendant, stacked silver rings, smudged black eyeliner and messy waves, nothing hanging over the chest",
    "oldmoney": "styled old-money it girl: low-rise cream tailored trousers, gold hoop earrings, tortoiseshell sunglasses pushed up on her head and a sleek high ponytail",
}
VIBE = {
    "spider-crop-top": "y2k", "radio-silence-live-crop-top": "grunge", "8-ball-trio-crop-top": "y2k",
    "life-is-better-brunette-crop-top": "y2k", "lucky-girl-crop-top": "y2k", "leopard-star-crop-top": "y2k",
    "star-girl-crop-top": "grunge", "lucky-8-ball-crop-top": "y2k", "circuit-de-monaco-1968-crop-top": "oldmoney",
    "national-anthem-kisses-crop-top": "coquette", "life-is-better-blonde-crop-top": "coquette",
    "crystal-bow-crop-top": "coquette",
}

# Baddie studio poses: always facing the camera (keeps Mia's face), hands never over the chest print
POSES = [
    "one hand on her popped hip and the other hand lifting a strand of hair off her shoulder, chin slightly lowered, a sly confident smirk",
    "both thumbs hooked into the front belt loops of her low-rise bottoms, shoulders back, weight on one leg, an unbothered pout",
    "one hand resting on top of her head with her elbow out and the other hand on her waist, lips slightly parted, a sultry half-lidded stare",
    "holding a pink flip phone up beside her cheek as if mid-call, the other hand on her hip, one eyebrow raised, a smug grin",
    "flashing a playful peace sign beside her face, the other thumb hooked in her waistband, head tilted, a cheeky grin",
    "both hands tucked into the back pockets of her bottoms, hip cocked to one side, chin up, an icy model stare",
    "biting her lower lip with a cheeky smile, one hand toying with her earring, the other hand on her hip",
    "running one hand through her hair, hip cocked, the other hand resting on her thigh, a bold direct stare",
]
STUDIO = ("framed from the top of her head to just below her hips, standing against a seamless soft blush pink studio "
          "backdrop, bright even studio lighting with a soft shadow, a high-end fashion e-commerce photo")

# One lifestyle shot per design: (colour, scene)
LIFE = {
    "spider-crop-top": ("White", "a flash photo at night inside a neon-lit arcade, she leans against a glowing claw machine and faces the camera with a sly smirk"),
    "radio-silence-live-crop-top": ("Black", "a flash photo at a crowded indie gig, stage lights and a band blurred behind her, she faces the camera with a smirk and one hand raised in a rock sign"),
    "8-ball-trio-crop-top": ("Light Baby Pink", "a photo in a moody retro pool hall, she leans back against a green felt pool table holding a cue, warm overhead lamp light, she faces the camera with a confident smile"),
    "life-is-better-brunette-crop-top": ("Beige", "a photo in a sunny Bandra café, she leans on the counter with an iced coffee, soft window light, she faces the camera with a flirty smile"),
    "lucky-girl-crop-top": ("White", "a photo at golden hour in a narrow Mumbai gully with colourful painted walls and hanging laundry, one hand on her hip, she faces the camera with a playful grin"),
    "leopard-star-crop-top": ("Black", "a flash photo at night on the Marine Drive sea wall with the glowing city skyline behind her, wind in her hair, she faces the camera with an icy stare"),
    "star-girl-crop-top": ("Black", "a flash photo at night in a graffiti-covered underpass, she leans against the painted wall and faces the camera with a moody stare"),
    "lucky-8-ball-crop-top": ("Light Baby Pink", "a photo at night outside a 24-hour convenience store under bright fluorescent light, sipping a blue slushie through a straw, she faces the camera with a cheeky look"),
    "circuit-de-monaco-1968-crop-top": ("White", "a photo on a sunny coastal road, she leans against a red vintage 1960s sports car, bright Mediterranean sunlight, she faces the camera with a cool smile"),
    "national-anthem-kisses-crop-top": ("White", "a photo on a rooftop at sunset with string fairy lights, red lipstick, holding a red heart-shaped lollipop, she faces the camera with a dreamy half-smile"),
    "life-is-better-blonde-crop-top": ("Black", "a flash photo in a pink-lit bedroom with posters and fairy lights, she sits on the edge of the bed and faces the camera with a pout"),
    "crystal-bow-crop-top": ("Black", "a flash photo at night on a busy Mumbai street with neon shop signs and auto rickshaws blurred behind her, she faces the camera with a confident smirk"),
}

def krea(colour, styling, rest):
    return (f"a photo of mia {rest}, wearing a plain {COLOUR[colour]} cropped half-sleeve cotton crop top with no print or logo on it, "
            f"the front of the top fully visible with nothing covering it, {styling}")

def qwen(h, colour):
    col = COLOUR[colour]
    return (f"<image1> is a photo of a young woman wearing a plain {col} crop top. "
            f"<image2> is a product photo of a {col} cotton crop top with short sleeves and {PRINT[h]}. "
            f"Replace the plain top she is wearing in <image1> with the exact crop top from <image2>: the same {col} colour, "
            f"the same cropped length and short sleeves, and the same print, reproduced exactly with any words spelled exactly "
            f"the same, at the same size and position on the chest. Keep her face, hair, makeup, accessories, body, pose, "
            f"hands, bottoms, background and lighting exactly the same as in <image1>. Only the top changes.")

shots, seed = [], 2000
for p in cat:
    h, styling = p["h"], STYLE[VIBE[p["h"]]]
    for i, c in enumerate(p["colors"]):
        pose = POSES[(i + len(shots)) % len(POSES)]
        slug = c["c"].lower().replace(" ", "-")
        seed += 1
        shots.append({"id": f"{h}__{slug}__studio", "h": h, "title": p["t"], "colour": c["c"], "kind": "studio",
                      "seed": seed, "ref": f"refs/{h}__{slug}.jpg",
                      "krea": krea(c["c"], f"{styling}, {STUDIO}", f", {pose},").replace("mia , ", "mia, ").replace(",, ", ", "),
                      "qwen": qwen(h, c["c"])})
    colour, scene = LIFE[h]
    slug = colour.lower().replace(" ", "-")
    seed += 1
    shots.append({"id": f"{h}__{slug}__life", "h": h, "title": p["t"], "colour": colour, "kind": "life", "seed": seed,
                  "ref": f"refs/{h}__{slug}.jpg",
                  "krea": krea(colour, f"{styling}. {scene[0].upper() + scene[1:]}", "").replace("mia , ", "mia, "),
                  "qwen": qwen(h, colour)})

for s in shots:
    assert (S / s["ref"]).exists(), s["ref"]
json.dump(shots, open(S / "shots.json", "w"), indent=1)
print(len(shots), "shots:", sum(s["kind"] == "studio" for s in shots), "studio,", sum(s["kind"] == "life" for s in shots), "lifestyle")
