import { CALENDLY_URL } from "@/lib/site";
import { getBook, type Book, type BookId } from "@/lib/books";

export { CALENDLY_URL };

export interface JournalEntry {
  slug: string;
  title: string;
  category: string;
  teaser: string;
  paragraphs: string[];
  midCtaAfter: number;
  metaTitle: string;
  metaDescription: string;
}

export type ArticleEntry = JournalEntry;

export const journalEntries: JournalEntry[] = [
  {
    slug: "how-to-stop-overthinking",
    title: "How to Stop Overthinking",
    category: "Mental Patterns",
    teaser: "Most people who want to stop overthinking have already tried the breathing exercises. They work for eleven minutes — then the thoughts come flooding back, louder than before, because the real reason was never addressed.",
    metaTitle: "How to Stop Overthinking",
    metaDescription: "Overthinking is not a habit or a personality flaw. It is a symptom of something bigger — and understanding what drives it is the only thing that actually makes it stop.",
    midCtaAfter: 8,
    paragraphs: [
      "Most people who want to know how to stop overthinking are not looking for a breathing exercise or a five step plan. They have already tried those. They work for about eleven minutes and then the thoughts come flooding back in, usually louder than before, because the underlying reason for the overthinking was never addressed.",
      "So, before we get into anything practical, it is worth asking a question that almost nobody asks.",
      "Why are you overthinking in the first place?",
      "Because overthinking is not a habit or a personality flaw. It is not something that happens to unlucky people with busy minds. It is a symptom of something much bigger going on behind it. And like most symptoms, treating the surface of it without understanding what is driving it is a bit like turning the volume down on a fire alarm rather than finding the fire.",
      "Overthinking, in almost every case, comes from the same source. The need to get things right before you act. And the need to get things right before you act almost always comes from the same place — fear of what other people will think, feel or say about you if you do not.",
      "Think about what you are actually doing when you overthink. You are running every possible scenario through your head before committing to anything. You are imagining how this person will react, how that person will judge you, what this choice will say about you to the people around you. You are essentially trying to pre-approve your own decisions through the imagined opinions of everyone in your life before you have even made them.",
      "To help this you must understand the ego — that part of you that has spent years learning how to keep you safe and accepted — is the engine behind most overthinking. It has built its entire existence around knowing how to be received well by the people around you. It has studied the room, understood the rules and learned exactly what kind of person earns love, respect and belonging in the world you move through. So, every time you are about to make a decision, it pulls you back and runs a check to find every possible way it could go wrong and whether it is more likely to result in a socially positive or negative way. It wants no risk but just absolutely certainty you are not going to look stupid, be rejected or lose someone's approval before it proceeds, hence the voice in your head going a million miles an hour.",
      "So why does it drain and exhaust you so much? Because it never ends. There is always another scenario to consider, another person's reaction to imagine, another version of events where something goes wrong. The mind keeps running because the ego keeps running it, and the ego does not stop until it feels safe. Which is almost never, because safety to the ego is approval. And approval, from other people, is never fully guaranteed and nor should it be if you are truly who you are meant to be. If you do not stand for anything then you will fall for everything and if you are a friend to everybody then you are an enemy to yourself because the only person whose approval you never seek is your own.",
      "This is why the conventional advice to just stop overthinking does not work. You cannot will yourself out of a process that is running automatically beneath the surface of your conscious awareness. You cannot think your way out of overthinking just like you can't drink yourself out of an alcohol addiction. However, the answer is not just to think less. The answer is to understand what the thinking is protecting you from, and then to look honestly at whether that protection is actually serving you or just keeping you small.",
      "There is a version of you that already knows what to do and knew before the overthinking ever started. It had an instinct and a sense of direction before the ego stepped in and began running its checks. That version of you is not wrong but just feels it because of how unfamiliar it is to just be you despite what others might think. It is just you, without the performance. Without the need to pre-approve every thought and decision through the lens of other people's opinions.",
      "Learning how to stop overthinking is really learning how to trust that version of yourself again.",
      "Not all at once or by pretending the fear is not there. But by starting to notice, in real time, when the overthinking begins. Who are you imagining judging you right now? Whose approval are you unconsciously seeking before you will allow yourself to move forward? What is the thought underneath the overthinking that you are trying to avoid facing?",
      "Those questions will tell you more about your overthinking than any technique ever could.",
      "If you recognise yourself in any of this, it is probably not a coincidence. The work I do is built around exactly this territory — understanding what is driving the patterns that keep people stuck, and changing the way you see those patterns so fundamentally they lose their grip. It starts with a free twenty minute conversation.",
    ],
  },
  {
    slug: "why-do-i-feel-lost-in-life",
    title: "Why Do I Feel Lost in Life?",
    category: "Identity",
    teaser: "If you have found yourself asking this recently, the chances are you did not always feel this way. There was a time when things felt clearer — when the life you were living actually felt like yours.",
    metaTitle: "Why Do I Feel Lost in Life?",
    metaDescription: "Feeling lost is not a destination. It is what happens when the version of yourself the world shaped you into has drifted far enough from the real one that the distance becomes impossible to ignore.",
    midCtaAfter: 8,
    paragraphs: [
      "If you have found yourself asking this and pondering over it recently, the chances are you did not always feel this way. There was a time when things felt clearer. When you had a sense of what mattered to you, what you enjoyed, what kind of person you were and what kind of life you wanted. It may not have been perfectly mapped out, but it felt like yours.",
      "Then gradually over time, almost imperceptibly, something changed and you now feel almost a stranger to that person or the person you know you should be.",
      "It didn't happen in a single moment. Nor was it because of one decision or one relationship or one wrong turn. But slowly, over years, through the quiet accumulation of other people's expectations, other people's definitions of success, other people's ideas about what a life well lived is supposed to look like. The world has a way of doing this and it drags so many people from who they really are. It gets into the gaps between who you are and who it needs you to be, and it fills them. The problem most of us don't realise is that we let it, because fitting in feels safer than standing out, and belonging feels better than being different, and at some point you stopped noticing that the version of yourself you were presenting to the world was drifting further and further from the one you started with.",
      "That is what happens to almost everyone. The world is very good at reshaping people and very cunning and sneaky about the fact that it is doing it because once one person does it they help convince the next to follow suit.",
      "Most people who feel lost in life are not drastically failing or completely falling apart. They are, in many cases, functioning perfectly well on the outside. They show up as fathers, mothers, partners, friends and colleagues. They help those around them where they can and are living perfectly normal lives as far as an outsider looking in is concerned. It is just underneath all of that there is a niggling feeling that something is off. Almost a numbness residing within them that gives a persistent sense that the life they are living makes sense on paper but does not feel fully theirs. That they have arrived somewhere without quite knowing how, and that the arrival does not feel like the destination they would have chosen.",
      "That feeling — the numbness and discomfort despite everything going well — is a sign and one you should give attention to. What it is usually signalling is that somewhere along the way, probably gradually and probably without you noticing, you drifted away from yourself. Not in a single moment of catastrophic decision making at a turn in your life that can be pinpointed. Just slowly over years, through the accumulation of small adaptations and ways of going about your daily life. You learned what was acceptable in the rooms you moved through. You learned what kind of person earned approval, belonging and love in the world around you and slowly you adapted into that person to climb the hierarchy that surrounded you.",
      "The problem is that the person you became was built for other people. It was built for their comfort, their expectations, their idea of who you should be and the further you travel inside that person, the further you get from the one underneath it. The one that existed before the adaptations and expectations started. The one that still exists now, waiting for you to kick down the door and rediscover it so you can play the game of life as you rather than some character built up by other people.",
      "When people ask why they feel lost in life, they are almost always describing the gap between those two versions of themselves. The performed version that the world sees and has come to expect. And the real version that has been waiting — either patiently or not so patiently — to be fulfilled.",
      "That gap has a cost. It shows up as a low level exhaustion that sleep does not fix or as a sense of going through the motions. As a difficulty making decisions because you are no longer sure what you actually want as opposed to what you think you are supposed to want. As a creeping feeling that time is passing and the life you imagined is somehow always just around the next corner rather than happening right now.",
      "None of this means something is wrong with you. It means you are human and you have done what humans do in order to survive socially and emotionally in a world that has always rewarded fitting in over authenticity.",
      "But survival is not the same as living. And knowing the difference is where things start to change.",
      "The feeling of being lost is not a destination. It is a sign that kicks you back on the road to being yourself again. It is the thing that resurfaces questions you have been putting off facing for years. Questions like what do I actually want, not what I have been told to want. What parts of my life feel genuinely mine, and what parts were built around someone else's expectations. What would a life that felt fully true to me actually look like.",
      "Those questions are uncomfortable precisely because they are real and can't just be batted off with generic answers. Sitting with them is the start of finding your way back to a version of yourself that does not feel like a performance.",
      "That is the work I do. Not telling people who they should be but stripping back what they have been told they are and helping them find the true version of themselves that waits underneath before helping them rebuild a life around that person. If any of this has landed, even quietly, a free twenty minute conversation is the only place it needs to start.",
    ],
  },
  {
    slug: "how-do-i-stop-people-pleasing",
    title: "How Do I Stop People Pleasing?",
    category: "Authenticity",
    teaser: "You already know, on some level, that people pleasing is costing you something. You have felt it in the tiredness after saying yes when every part of you meant no.",
    metaTitle: "How Do I Stop People Pleasing?",
    metaDescription: "People pleasing is not about other people. It is self-protection masquerading as generosity — and once you see that, it is very hard to unsee.",
    midCtaAfter: 7,
    paragraphs: [
      "If you are reading this then there is a good chance you already know, on some level, that people pleasing is costing you something. I am willing to bet you have felt it in the tiredness that follows a conversation where you said yes when every part of you meant no. You have felt it in the resentment that builds up when you realise you have spent another day altering who you are and your own actions and behaviour around everyone else's comfort while your own comfort is overlooked. You have felt it in the moments alone when you notice how different you are when nobody is watching, how much more relaxed and yourself you can be — and you wonder why that version of you only gets to exist in private.",
      "People pleasing sounds harmless. The name almost makes it sound like a virtue. You are pleasing people. You are making them happy while keeping the peace and making yourself easy to be around and ensuring that everyone in your life has a good experience of you. What could possibly be wrong with that?",
      "The problem is that people pleasing is not actually about other people at all. It is about you and the deeply uncomfortable feeling that arises when you sense that someone might be disappointed in you, frustrated with you or pulling away from you. The pleasing is not generosity. It is self-protection masquerading as generosity and once you see this it is very hard to unsee. This is why so many people from difficult upbringings, bad past relationships or who were bullied people please. They hate the feeling they feel when any sort of conflict or stress or disappointment arises and so have adapted to perform in a way that minimises it possibly happening when they are present.",
      "Think about the last time you agreed to something you did not want to do. Stayed somewhere longer than you wanted to stay, took on something you did not have the capacity for, softened an opinion you actually held firmly because the room was not going to agree with you or receive it well. What was the thought underneath that decision? I am willing to bet it was not just purely 'I want this person to be happy' — but actually 'I do not want this person to be unhappy with me'. Those two things feel similar but they are completely different. One is care for another person and the other is management of your own anxiety about how you are being perceived.",
      "This is where the ego becomes the engine behind people pleasing in the same way it is behind so many of the patterns that keep us from living honestly. The ego is wired, deeply and historically, to keep you accepted and therefore safe within the social world around you. To the ego, disapproval is not just uncomfortable but actually a sign of danger. This is because it activates the same primal part of you that once understood rejection from the tribe as a genuine threat to survival.",
      "In essence, your nervous system does not know the difference between being disliked by a group of colleagues and being cast out into the wilderness left to fend for itself. It responds to both with the same urgency. So the ego does everything it can to ensure you are palatable, agreeable and unlikely to cause a reaction in anyone that might put your belonging in the tribe at risk.",
      "The result is a life lived in two modes. The version of you in public, which is careful and managed and attuned to every signal coming from the people around you, and the version of you in private, which is exhausted by the performance and increasingly unsure of what it actually thinks and wants and feels beneath it all. Over time the gap between those two versions widens and the private one gets quieter and the public one gets more automatic and one day you look up and realise you cannot quite remember the last time you made a decision that was purely and completely yours.",
      "What makes people pleasing so difficult to stop is that it works in the short term. The other person stays happy, the tension dissolves, the approval is maintained and the anxiety passes. The ego gets exactly what it was looking for and checks this approach off as a success. Every time you people please, you reinforce to yourself that your own comfort and honesty are less important than the other person's reaction, and that your true self and voice cannot be trusted because they might cause conflict. You teach yourself, over and over again, that who you actually are is a risky person to fully embrace.",
      "That is the real cost of people pleasing. Not just the exhaustion of the performance or the slow erosion of your own needs going unmet. But the message it sends to the truest part of you every single time you choose someone else's comfort over your own truth.",
      "Stopping it is not about becoming blunt or difficult or suddenly deciding you no longer care about anyone else. It is about something much more fundamental than that. It is about learning to notice, in real time, when you are about to edit yourself for someone else's benefit and then asking honestly whether what you are about to say or do is coming from genuine care for that person or from fear of their reaction to the real you. Those two things feel identical from the inside until you learn to tell them apart.",
      "That distinction is what I help people with and where my work begins. If you recognise yourself in any of this, the patterns I work with in coaching are built around exactly this territory — understanding where people pleasing comes from, what it is protecting you from, and what becomes possible when you begin to live without it. It starts with a free twenty minute conversation.",
    ],
  },
  {
    slug: "why-do-i-feel-disconnected-from-myself",
    title: "Why Do I Feel Disconnected from Myself?",
    category: "Identity",
    teaser: "It is not depression exactly, and not unhappiness in the straightforward sense. Life looks perfectly acceptable — yet something is absent. A kind of numbness, like you are watching your life through a lens rather than truly living it.",
    metaTitle: "Why Do I Feel Disconnected from Myself?",
    metaDescription: "Feeling disconnected from yourself is almost never random. It has a real source — and in most cases, that source is the gap between who you actually are and the life you have been living.",
    midCtaAfter: 7,
    paragraphs: [
      "There is a particular kind of disconnection that is very difficult to explain or pinpoint to someone who has not felt it. It is not depression exactly, though it can come along with this or feel like similar symptoms. It is not unhappiness in the straightforward sense, because from the outside and sometimes even from the inside, life looks perfectly acceptable and there is not one blaring hole that needs filling. The bills are paid, the relationships are intact, the routine is serving you as it should — yet something is absent. A lot of clients almost describe it as a kind of numbness within them, like they are going through all the motions of life but are almost a step back watching it through a lens rather than truly feeling and experiencing it fully.",
      "People who feel disconnected from themselves often struggle to articulate what is wrong precisely because nothing is obviously wrong. If something had gone badly, if there was a clear reason, it would at least be understandable or socially reasonable to attach this feeling to an obvious cause. The problem is that this is a disconnection without an obvious cause and that makes it easy to dismiss and to tell yourself it is probably nothing and wait for it to pass. Except it does not just pass by but rather kind of lies dormant occasionally and then resurfaces, usually in the moments when the distractions run out.",
      "What most people do not realise is that feeling disconnected from yourself is almost never random. It has a real source and in the vast majority of cases that source is that the life you are living and the self you are living it as have drifted so far from what is actually true for you that the distance has become impossible to ignore.",
      "Think of it this way — you are not one fixed thing or able to be summarised with one label. You are a living, feeling, thinking person with a complex mind and a multitude of ideas and thoughts inside of you that can't simply be boxed up in some preconceived identity. When you are living in alignment with that inner world, making decisions that come from it, expressing yourself honestly within it and building a life that actually reflects it, there is a sort of inner balance to your existence.",
      "The problem is when you spend years, as most people do, adapting yourself to the world around you rather than building a world around yourself, that coherence begins to fracture. You become very good at being what is needed in each room you walk into, at saying the right things and performing the right version of yourself for each situation and each relationship. The more skilled you become at that performance, the further you travel from the person underneath it. One small compromise at a time, one small editing of yourself at a time, until the distance between who you are and who you present yourself to be has grown large enough to feel like an emptiness sits within you.",
      "The disconnection you feel is that emptiness making itself known.",
      "It tends to show up in ways I am sure you are familiar with. It can be an inability to feel genuinely excited or moved by things that should matter, or a sense that your emotions are muted or delayed. Sometimes it is a difficulty knowing what you actually want when someone asks — not because you are indecisive but because the part of you that knows what it wants has been so consistently overridden that its voice has been drowned out. Or it can be a feeling in certain moments of clarity, usually when you are alone and the performance is not required, that the life around you does not quite feel like it belongs to you.",
      "All of those experiences point to the same thing. A self that has been living at a remove from itself for long enough that the removal now feels like the default.",
      "The way back is not as complicated as it sounds but it does require honesty. Not the kind of honesty you perform for other people but the kind you practice alone, in the questions you have been avoiding. What do I actually feel about this, not what am I supposed to feel. What do I actually want from this, not what is expected of me. Where in my life am I performing and where am I actually present? Whose version of me am I living right now and how much of it is genuinely mine?",
      "Those questions are uncomfortable because they have real answers that are true to you and not fine-tuned to fit other people's script. And real answers sometimes point towards real changes. But the discomfort of asking them is considerably smaller than the cost of continuing to live at a distance from yourself indefinitely.",
      "The disconnection is not a permanent state. It is a signal from the part of you that has never stopped being real, telling you it is still there and that it is ready to be lived when you are ready to make that leap.",
      "That is the territory I work in. Helping people understand where the disconnection came from, what has been driving it and what it actually looks and feels like to start closing the gap between the life you are living and the one that is genuinely yours. It starts with a free twenty minute conversation.",
    ],
  },
  {
    slug: "how-to-recover-from-burnout",
    title: "How to Recover from Burnout",
    category: "Exhaustion",
    teaser: "Genuine burnout is not fixed by rest because it is not caused by overwork alone. It is caused by a sustained mismatch between the life you are living and the person you actually are.",
    metaTitle: "How to Recover from Burnout",
    metaDescription: "You can take two weeks off and come back feeling exactly the same. The holiday paused the demands but it did not address the source. Real recovery goes further than most burnout advice prepares you for.",
    midCtaAfter: 6,
    paragraphs: [
      "The word burnout gets overused a lot and because of that it has started to lose some of its weight. People say they are burned out when they mean they are tired after a busy week, need a holiday or just have shown up hungover for a few days and would rather be in bed. This is not the same thing — but because of people saying it so often, the people who are genuinely burned out, the ones for whom no amount of rest seems to fix anything and no weekend away makes a lasting difference, often end up questioning whether what they are experiencing is real or whether they are just being dramatic about something everyone else seems to manage perfectly well.",
      "Genuine burnout is not fixed by rest because it is not caused by overwork alone, even though overwork is usually somewhere in the story. In fact often it can have nothing to do with work at all. It is caused by a sustained and fundamental mismatch between the life you are living and the person you actually are. Between what you are spending your energy on and what actually matters to you. Between the version of yourself you are maintaining every day for the world around you and the one that exists underneath it, increasingly depleted and unable to keep up the performance.",
      "That is why you can take two weeks off and come back feeling exactly the same as soon as you walk back into work, because the holiday paused the demands but it did not address the source. The source is still there waiting for you when you return, unchanged and unexamined and so drains you all the same.",
      "Most people who experience burnout have been running on a particular kind of fuel for a long time. The fuel of obligation, expectation and the need to be seen as capable, reliable and together by everyone around them. They have been showing up and delivering and meeting demands not because every part of them genuinely wants to, but because the alternative — letting someone down, admitting they are struggling, or stepping back from a role or identity they have built around being someone who copes — feels more frightening than continuing to push through. So they push through until they cannot anymore.",
      "The reason it is so disorienting when it arrives is that it does not just exhaust you physically. It empties you in a way that goes further than that — it goes at the things you used to enjoy and makes them stop feeling enjoyable. It brings you to tears over the tiniest inconveniences or causes you to snap at family and partners where you would never have before. Even small decisions start to feel overwhelming because the part of you that normally generates motivation and direction has nothing left to draw from. You can sleep eight hours and wake up already tired before lifting a finger. This is because the exhaustion is in the gap between who you are and who you have been pretending to be for long enough that the pretending has become unsustainable.",
      "Recovery from burnout — real recovery rather than temporary relief — almost always requires going further than most people expect to go. It requires looking honestly not just at what you have been doing but at why you have been doing it and whether the life that burned you out was genuinely yours to begin with or whether it was built around what was expected of you, approved of, or what kept everyone around you comfortable at the expense of what was actually true for you.",
      "That is a bigger and more confronting question than most burnout advice prepares you for. Most advice will tell you to rest more, set boundaries, say no to things, take breaks and look after yourself. All of that is true but if the life you return to after the rest is still fundamentally misaligned with who you actually are, the boundary setting and the self care will only take you so far. You will recover partially and then slowly, almost without noticing, the drained feeling will creep back up on you.",
      "The deeper recovery is about building something honest. A life that does not require you to perform a version of yourself that costs you everything to maintain. A sense of direction that comes from something real rather than something inherited or approved of or expected. An understanding of what has been driving the exhaustion so that you can stop feeding it.",
      "None of that happens overnight. It is slow work and honest work and sometimes uncomfortable work. But it is the only kind that actually addresses what burnout is pointing at rather than just managing its symptoms until they return.",
      "If you are in the middle of this right now, or just beginning to recognise the shape of it in your own life, a free twenty minute conversation is where work with me begins — to strip back the problem and start building a life that is actually true to you.",
    ],
  },
  {
    slug: "why-do-i-care-so-much-what-people-think",
    title: "Why Do I Care So Much What People Think?",
    category: "Authenticity",
    teaser: "If you have ever spent twenty minutes replaying a conversation wondering whether you came across well, or changed your answer mid-sentence because you sensed the room was not going to receive it — you already know what it feels like to live inside this question.",
    metaTitle: "Why Do I Care So Much What People Think?",
    metaDescription: "Caring too much what people think is not a switch you consciously turned on. It is one of the oldest and most deeply wired parts of being human — and understanding where it comes from is the first step towards having any real relationship with it.",
    midCtaAfter: 7,
    paragraphs: [
      "If you have ever spent twenty minutes replaying a conversation wondering whether you came across well, or changed your answer mid-sentence because you sensed the room was not going to receive it, then you already know what it feels like to live inside this question.",
      "Before understanding what I now teach I would spend so many potential social interactions just repeating the first sentence to myself in my head and then playing out all the possible replies I might get and play out the whole thing before almost always deciding to say nothing. It feels like madness but really it is just giving way too much weight to what others think and being dictated by it.",
      "If this sounds familiar at all you probably also know that simply deciding to care less does not work, because if it did you would have done it by now.",
      "The reason caring what people think is so difficult to switch off is that it was never a switch you consciously turned on in the first place. It is one of the oldest and most deeply wired parts of being human, and understanding where it actually comes from is the first step towards having any real relationship with it rather than just being dragged around by it.",
      "Your brain was built in a very different world to the one you live in now. A world where belonging to a group was not a social preference but a survival necessity. Where being rejected by the people around you was a genuine and immediate threat to your physical safety. In that world, knowing how you were being perceived and adjusting your behaviour accordingly was not anxiety but rather a kind of necessary social awareness that kept you alive.",
      "The problem is that part of your brain never got the update. So when a colleague seems unimpressed, or a friend goes quiet on text, or someone at a social event does not respond the way you hoped, something in you reacts with a disproportionate urgency. Not because the situation is actually dangerous but because the part of your brain that monitors social approval does not know the difference.",
      "What we are speaking about is the ego — the part of you that has spent years studying the rooms you move through, learning what kind of person is valued, and constructing a version of you most likely to be received well in every situation. It watches everything and responds with the urgency of something that genuinely believes your safety depends on getting this right.",
      "Which is a very exhausting way to live. The thing is, approval from other people is not a stable currency — it fluctuates and is inconsistent and it is entirely outside your control. But the ego does not factor that in. It just registers that approval was not fully secured and redoubles its efforts to figure out what went wrong and mould your character to be someone who can gain that approval next time.",
      "The goal is not to stop caring altogether. People who genuinely do not care what anyone thinks are not free. They are simply running a different kind of defence — borderline numb to shut off any chance at disappointment. It is a sort of 'if I don't try then I can't lose' approach.",
      "The goal is to build something more solid underneath the caring so that other people's opinions stop being the primary thing your sense of self depends on.",
      "Building that requires understanding what has been driving the caring in the first place, where it came from and what it has cost you. That understanding is what changes things permanently — allowing you to stop being defined by others and actually find a clear, confident sense of who you are, stripping all power from other people's opinions.",
      "That is the work I do. It starts with a free twenty minute conversation.",
    ],
  },
  {
    slug: "why-do-i-feel-like-a-fraud",
    title: "Why Do I Feel Like a Fraud?",
    category: "Authenticity",
    teaser: "Feeling like a fraud is one of the most common experiences people have — yet it is almost impossible to talk about, because to admit it feels like handing someone the very evidence you have been trying to keep hidden.",
    metaTitle: "Why Do I Feel Like a Fraud?",
    metaDescription: "Imposter syndrome persists not because you are incapable, but because you are living at a distance from yourself large enough that external validation never quite reaches the real you.",
    midCtaAfter: 7,
    paragraphs: [
      "There is something particularly isolating about feeling like a fraud. Not because the feeling is rare — it is actually one of the most common experiences people have through their professional and personal lives. It feels isolating because the nature of it makes it almost impossible to talk about because to admit that you feel like a fraud is to risk confirming it. To say out loud that you are not sure you deserve to be where you are, or that you are terrified someone is going to realise you are not as capable or together or confident as you appear, feels like handing someone the very evidence you have been trying to keep hidden so most try to uphold the illusion and say nothing.",
      "They perform competence and the role of someone who is good enough for the role while privately questioning whether the job is for them. They accept the praise but secretly, when they hear it, they feel like it is false and means nothing. They keep moving forward while waiting, with a low level dread that never quite goes away, for the moment the disguise is ripped off and someone realises they aren't actually meant to be there. Kind of like someone sneaking backstage at a concert hoping none of the guards check for a pass.",
      "If that sounds familiar, the first thing worth knowing is that what you are describing has a name. It is called imposter syndrome and it is so widespread that research consistently finds it affects the majority of high-functioning people at some point in their lives, including many of the people who appear, from the outside, to have it most together.",
      "Obviously just knowing it has a name does not make it go away and most of the advice that follows the same old stuff — reminding yourself of your achievements, collecting evidence of your competence and telling yourself you belong here. All of which tends to work in the same way as most surface level solutions. It addresses the symptom while leaving the source completely untouched.",
      "The source in almost every case goes deeper than professional insecurity — it sits in the gap between the version of yourself you present to the world and the version you know privately. The truth is that the wider that gap gets, the more persistent the feeling of fraud tends to be.",
      "Think about it this way. If you have spent years carefully constructing and maintaining a version of yourself that is designed to be received well, to earn approval, to meet expectations and to fit the image of the kind of person who belongs in the rooms you move through, then some part of you always knows that what people are responding to is the mask rather than the person underneath it. You are being praised for the performance, you are being trusted on the basis of the mask and because you know the mask is there, the praise feels hollow and the trust feels precarious — because it was given to someone you are not entirely sure you actually are.",
      "This is like if Tom Holland received compliments directed to Spider-Man, or if Daniel Craig received praise about James Bond. They would know it is not about them but something separate from them. Just a performance they put on for others — and if that was the only praise they ever heard, the real part of them would begin to feel hollow.",
      "That is the real reason the feeling of fraud persists even when the evidence of your competence is stacked so high you can't see the top. It is not that you are actually incapable but just that you are living at a distance from yourself large enough that you have lost confidence in the person underneath the performance. The external validation never really lands. It slides off the surface of the constructed version and never reaches the real one, which is the only version that would actually feel it.",
      "The ego built the mask with the best of intentions. It studied what success looked like in your world and helped you become it. It learned what kind of person earned respect and belonging and shaped you accordingly. The problem is that it is willing to abandon who you truly are to make you someone that is accepted — and in doing so it created a version of you that is always one layer removed from what is actually true. That distance is what the feeling of fraud is describing.",
      "The way through it is not more evidence of your competence. It is a more honest relationship with who you actually are, separate from the performance. Understanding what the performance was protecting you from, why the masks were built, where the gap opened up and why it has stayed open for so long — and then doing the work to close it.",
      "When the distance between who you are and who you present yourself to be starts to narrow, the feeling of fraud begins to lessen. You are simply here, as yourself, and the question of whether that is enough stops feeling quite so urgent.",
      "That is the territory I work in. And it starts with a free twenty minute conversation.",
    ],
  },
  {
    slug: "how-to-build-self-confidence",
    title: "How to Build Self Confidence",
    category: "Confidence",
    teaser: "Most advice about building self confidence starts in the wrong place entirely. It tends to work the way a plaster works on something that needs stitches — holding things together for a while, before the same feeling comes back.",
    metaTitle: "How to Build Self Confidence",
    metaDescription: "Real confidence is not built from the outside in. The people who have it are not the loudest in the room — they are the ones who know who they are and have stopped apologising for it.",
    midCtaAfter: 5,
    paragraphs: [
      "Most advice about how to build self confidence starts in the wrong place all together. It tells you to push yourself outside your comfort zone, collect evidence of your achievements and remind yourself of everything you have accomplished whenever the doubt creeps in.",
      "While none of that is exactly wrong, it tends to work the way a plaster works on something that needs stitches. It holds things together for a while and then the same feeling comes back, usually in a slightly different situation, and you are back to wondering why nothing ever seems to stick.",
      "The reason it does not stick is that most confidence advice is built on a misunderstanding of what confidence actually is.",
      "I agree that confidence in a specific field comes from having a stack of evidence that you do what you do. If a long jumper wants to feel confident standing at the start of the runway then having a thousand jumps behind them is definitely not going to hurt. However, most people who struggle with confidence don't just want it in one field — they want it in day to day life, no matter what they are doing. To achieve this, look at the people in your life who strike you as genuinely confident. Not the loud ones or the performative ones, but the ones with a settled 'I am who I am' quality to them. The ones who do not need the room to validate them before they say what they think. What those people have in common is that they know who they are and they have stopped apologising for it.",
      "That is what real confidence looks like and you cannot build it from the outside in.",
      "The reason so many people struggle with it has very little to do with capability and almost everything to do with the gap between who they actually are and who they have been presenting to the world. When you spend years shaping yourself around what is most likely to earn approval from the people around you, the praise and the validation all get directed at the constructed version of you rather than the real one. Some part of you knows this and gradually discounts every piece of praise because it knows the praise was not really for you but for the character you are performing.",
      "That is why confidence built on external validation is so fragile. It depends entirely on the validation continuing and you are only ever one critical comment away from feeling exactly as uncertain as before.",
      "If you are built from compliments you will collapse at the sight of an insult. In order to build true confidence you must align with who you genuinely are — not just what the world tells you that you are.",
      "That is the work I do. It starts with a free twenty minute conversation.",
    ],
  },
  {
    slug: "why-am-i-not-happy-even-though-i-have-everything",
    title: "Why Am I Not Happy Even Though I Have Everything?",
    category: "Identity",
    teaser: "This is one of those questions that feels shameful to ask — because the world does not make much space for it. When life looks perfectly fine from the outside, the unhappiness starts to feel like a problem you are not entitled to have.",
    metaTitle: "Why Am I Not Happy Even Though I Have Everything?",
    metaDescription: "Having everything does not guarantee happiness because happiness was never stored in the having. It has everything to do with who you are being while you have it.",
    midCtaAfter: 5,
    paragraphs: [
      "This is one of those shameful questions to ask ourselves that feels almost painful and is tricky for a person to sit with because the world does not make much space for it. The general understanding is that unhappiness is something that happens to people who do not have enough. When you have a job, a home, people who love you and a life that by most measures looks perfectly fine, the unhappiness feels like ungratefulness or like you are spoilt and like a problem you are not entitled to have. So, most people who feel this way do not say it out loud or share it in search of an answer but rather just count their blessings, remind themselves that other people have it worse and wait for the feeling to pass.",
      "Sometimes however it does not pass but just goes quiet for a while and then comes back, usually in the quiet where it is just you — when the distractions run out and there is nothing left to focus on.",
      "What you are experiencing is not ungrateful and nor is it a character flaw. It is one of the most common and most consistently misunderstood experiences of modern life. And the reason it is so misunderstood is that the explanation for it sits somewhere most people are never pointed towards.",
      "Having everything does not guarantee happiness because happiness was never stored in the having. Those things can make life more comfortable and more manageable and enjoyable to a degree but they cannot produce the contentment that comes from living a life that is genuinely and authentically yours, because that kind of contentment has nothing to do with what you have and everything to do with who you are being while you have it.",
      "When you have spent years becoming whoever you needed to be in order to be accepted and approved of by the world around you, you can arrive at a life that looks entirely successful and still feel like a stranger inside it. This is because the life was built around the performed version of you rather than the real one — and the real one, however silenced it has become, still knows the difference.",
      "The distance between who you actually are and who you are presenting yourself to be is what produces the feeling you are describing. Not the absence of good things but the presence of that gap. Closing it is the work we can do together and it begins with a willingness to sit honestly with the question you are already asking.",
      "I believe that when you change the way you see the world, the world you see changes — and often a small change of perception can be life-changing. It doesn't need some extravagant change physically but just a new lens to see the world through. If you are interested in beginning that journey, a free twenty minute conversation is where it starts.",
    ],
  },
  {
    slug: "why-do-i-feel-like-i-am-living-someone-elses-life",
    title: "Why Do I Feel Like I Am Living Someone Else's Life?",
    category: "Authenticity",
    teaser: "If that question has been sitting with you, even just popping up every so often, it is worth paying attention to. The feeling is not random and it is not ingratitude.",
    metaTitle: "Why Do I Feel Like I Am Living Someone Else's Life?",
    metaDescription: "The life that looks perfectly reasonable from the outside often wasn't built around you — it was built around what the world wanted for you. The feeling you can't name is the real you, still there underneath everything.",
    midCtaAfter: 4,
    paragraphs: [
      "If that question has been sitting with you, even just popping up every so often incrementally, it is worth paying attention to.",
      "The feeling of living someone else's life is not random and it is not ingratitude. It is what happens when the distance between who you actually are and who you have been presenting yourself as to the world grows large enough to become impossible to ignore. This did not just happen overnight — you arrived here gradually, through years of small adaptations and quiet compromises, through becoming whoever you needed to be in order to be accepted, approved of and loved by the people and the world around you.",
      "The life that resulted from all of that adapting might look perfectly reasonable from the outside. The career makes sense, the relationships are intact, the routine is functional — but something at the base of it all does not feel like yours at all. This is because it was not built around you but rather sold to you and built around what the world wanted for you. We are all gently pushed into stereotypes that define us based on our career, hobbies, age, background — and it completely rips us from our genuine self.",
      "We laugh at the idea of a builder on a construction site spending his breaks knitting and ordering a cocktail after work — but that social construct is precisely what keeps everyone acting as they think they should. Like they must fit the script that has been written for their life and in doing so they are pushed into this feeling of living someone else's life entirely.",
      "That is the life you are living and the feeling you are describing is the real you, still there underneath everything, letting you know it has not gone anywhere.",
      "The question is not how did I get here. The question is what would it look like to start building something that actually feels like mine.",
      "That is exactly the work I do. And it starts with a free twenty minute conversation.",
    ],
  },
  {
    slug: "why-do-i-behave-differently-around-different-people",
    title: "Why Do I Behave Differently Around Different People?",
    category: "Identity",
    teaser: "Most people who notice this about themselves feel a quiet unease. Like it is evidence of something dishonest or unstable in their character. But the real question is: across all of these versions, which one is actually you?",
    metaTitle: "Why Do I Behave Differently Around Different People?",
    metaDescription: "Behaving differently around different people is not dishonesty. It is the ego adapting you for each room — and the question that matters is which parts of you, across all those versions, are actually real.",
    midCtaAfter: 3,
    paragraphs: [
      "Most people who notice this about themselves feel a quiet unease about it. Like it is evidence of something dishonest or unstable in their character. They are one person at work and another at home, one version of themselves with their parents and an entirely different one with their friends and somewhere in the background there is a question they have never quite put into words. If I am all of these different people depending on who is in the room, which one is actually me?",
      "This question is extremely valid and the answer is that none of them are entirely you — but rather they are all versions of you that have been calibrated, usually without any conscious awareness, for the particular audience in front of you.",
      "The ego has spent years studying every room you move through and learning exactly what kind of person is valued, accepted and safe in each one. So over time it takes this data and adapts you accordingly the moment you walk through the door.",
      "The problem is not that it happens but that most people never notice it is happening and so never ask the question that matters most underneath it. Which parts of me, across all of these versions, are actually real. What do I think, feel and want when I am not performing for anyone? Who am I when nobody needs me to be anything in particular? Those are the questions that need diving into in order to find who you truly are and lift the weight that makes you feel like you are constantly juggling characters.",
      "These self-enquiring questions are brutal when first asked, especially to someone who sees themselves as an 'all-rounder' or a 'people person'. That may be true — but somewhere beneath the person that everyone likes is often a true version of yourself that fears the idea of being disliked so much that it is willing to hide forever.",
      "Helping people strip back what they have been made to feel they must perform as and actually embrace who they truly are is what I do. A free twenty minute conversation is where it starts.",
    ],
  },
  {
    slug: "why-do-i-feel-exhausted-by-people",
    title: "Why Do I Feel Exhausted by People?",
    category: "Exhaustion",
    teaser: "If spending time around other people leaves you feeling drained in a way that goes beyond introversion or needing a quiet evening to recover, it is worth looking at what is actually happening when you are around them.",
    metaTitle: "Why Do I Feel Exhausted by People?",
    metaDescription: "The exhaustion is rarely about the people themselves. It is almost always about the performance that runs alongside being with them — and the enormous amount of energy that costs.",
    midCtaAfter: 3,
    paragraphs: [
      "If spending time around other people leaves you feeling drained in a way that goes beyond introversion or needing a quiet evening to recover, it is worth looking at what is actually happening when you are around them.",
      "The exhaustion you are describing is rarely about the people themselves, nor is it because you are terminally unsociable or a broken human — it is almost always about what you are doing while you are with them.",
      "Most people who feel exhausted by social situations are not exhausted by the interaction, they are exhausted by the performance that runs alongside it. The constant monitoring of how they are being perceived, the real time adjustments to what they say and how they say it based on the reactions they are reading in the room, the effort of presenting a version of themselves that will be received well, agreed with, liked and kept close. All of that happens beneath the surface of the conversation, automatically and almost invisibly, and it costs an enormous amount of energy that never gets acknowledged because nobody can see it happening.",
      "You can sit with a friend or colleague for two hours, say all the right things, laugh in all the right places and come away feeling like you ran a marathon. Not because the friend was difficult or the conversation was demanding but because you were not really there. A carefully managed version of you was present and maintaining that version, for two hours, in real time, with another person whose reactions you are constantly reading and responding to, is genuinely exhausting work.",
      "The tiredness is not a sign that you do not like people. It is a sign that you have not yet felt safe enough to simply be yourself around them and the solution is not fewer people but just less performance.",
      "That shift is exactly what I work with. A free twenty minute conversation is where it starts.",
    ],
  },
];

export const articleEntries = journalEntries;

const articleBookMap: Record<string, BookId> = {
  "how-to-stop-overthinking": "thePolicy",
  "how-do-i-stop-people-pleasing": "thePolicy",
  "why-do-i-care-so-much-what-people-think": "thePolicy",
  "why-do-i-feel-like-a-fraud": "thePolicy",
  "why-do-i-behave-differently-around-different-people": "thePolicy",
  "why-do-i-feel-lost-in-life": "robinsBench",
  "why-do-i-feel-disconnected-from-myself": "robinsBench",
  "why-am-i-not-happy-even-though-i-have-everything": "robinsBench",
  "why-do-i-feel-like-i-am-living-someone-elses-life": "alienated",
  "how-to-build-self-confidence": "alienated",
  "how-to-recover-from-burnout": "alienated",
  "why-do-i-feel-exhausted-by-people": "alienated",
};

export function getEntry(slug: string): JournalEntry | undefined {
  return journalEntries.find((e) => e.slug === slug);
}

export const getArticle = getEntry;

export function getRelatedEntries(currentSlug: string, count = 3): JournalEntry[] {
  const current = getEntry(currentSlug);
  if (!current) return journalEntries.slice(0, count);

  const sameCategory = journalEntries.filter(
    (e) => e.slug !== currentSlug && e.category === current.category
  );
  const others = journalEntries.filter(
    (e) => e.slug !== currentSlug && e.category !== current.category
  );

  return [...sameCategory, ...others].slice(0, count);
}

export const getRelatedArticles = getRelatedEntries;

export function getArticleBook(entryOrSlug: JournalEntry | string): Book | undefined {
  const slug = typeof entryOrSlug === "string" ? entryOrSlug : entryOrSlug.slug;
  const bookId = articleBookMap[slug];

  return bookId ? getBook(bookId) : undefined;
}
