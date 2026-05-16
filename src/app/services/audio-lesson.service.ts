import { Injectable, signal } from '@angular/core';
import { AudioLesson } from '../models/audio-lesson.model';

@Injectable({ providedIn: 'root' })
export class AudioLessonService {
  private _lessons = signal<AudioLesson[]>([

    // ── A1 ─────────────────────────────────────────────────────────────
    {
      id: 'a1-1', level: 'A1', topic: 'Greetings', title: 'Xin chào và giới thiệu',
      description: 'Những câu chào hỏi đầu tiên — ngắn gọn và dễ nhớ.',
      lines: [
        { en: 'Hello! My name is Tom.', vi: 'Xin chào! Tên tôi là Tom.' },
        { en: 'I am ten years old.', vi: 'Tôi mười tuổi.' },
        { en: 'I am from Vietnam.', vi: 'Tôi đến từ Việt Nam.' },
        { en: 'I like cats and dogs.', vi: 'Tôi thích mèo và chó.' },
        { en: 'Nice to meet you!', vi: 'Rất vui được gặp bạn!' },
      ],
    },
    {
      id: 'a1-2', level: 'A1', topic: 'Colors & Objects', title: 'Màu sắc và đồ vật',
      description: 'Học tên màu sắc và đồ vật quen thuộc xung quanh bạn.',
      lines: [
        { en: 'This is a red apple.', vi: 'Đây là một quả táo đỏ.' },
        { en: 'The sky is blue.', vi: 'Bầu trời màu xanh lam.' },
        { en: 'I have a green bag.', vi: 'Tôi có một cái túi màu xanh lá.' },
        { en: 'My book is yellow.', vi: 'Quyển sách của tôi màu vàng.' },
        { en: 'Can you see the orange cat?', vi: 'Bạn có thể nhìn thấy con mèo màu cam không?' },
      ],
    },
    {
      id: 'a1-3', level: 'A1', topic: 'Family', title: 'Gia đình',
      description: 'Giới thiệu các thành viên trong gia đình bằng tiếng Anh.',
      lines: [
        { en: 'This is my family.', vi: 'Đây là gia đình của tôi.' },
        { en: 'My mother is kind.', vi: 'Mẹ tôi rất tốt bụng.' },
        { en: 'My father is tall.', vi: 'Bố tôi cao.' },
        { en: 'I have one sister.', vi: 'Tôi có một người chị gái.' },
        { en: 'We are happy together.', vi: 'Chúng tôi hạnh phúc bên nhau.' },
      ],
    },

    // ── A2 ─────────────────────────────────────────────────────────────
    {
      id: 'a2-1', level: 'A2', topic: 'Directions', title: 'Hỏi đường',
      description: 'Hỏi và chỉ đường — kỹ năng không thể thiếu khi ra ngoài.',
      lines: [
        { en: 'Excuse me, where is the bank?', vi: 'Xin lỗi, ngân hàng ở đâu?' },
        { en: 'Go straight and turn left.', vi: 'Đi thẳng rồi rẽ trái.' },
        { en: 'The supermarket is near the park.', vi: 'Siêu thị ở gần công viên.' },
        { en: 'How far is the train station?', vi: 'Ga tàu cách đây bao xa?' },
        { en: 'It is about five minutes by foot.', vi: 'Đi bộ khoảng năm phút.' },
      ],
    },
    {
      id: 'a2-2', level: 'A2', topic: 'Shopping', title: 'Đi mua sắm',
      description: 'Hỏi giá, chọn size, thanh toán — những câu thực tế nhất.',
      lines: [
        { en: 'How much does this shirt cost?', vi: 'Áo này giá bao nhiêu?' },
        { en: 'It costs twenty dollars.', vi: 'Giá hai mươi đô la.' },
        { en: 'Do you have a smaller size?', vi: 'Bạn có cỡ nhỏ hơn không?' },
        { en: 'I would like to pay by card.', vi: 'Tôi muốn thanh toán bằng thẻ.' },
        { en: "Here is your receipt. Have a nice day!", vi: 'Đây là hóa đơn của bạn. Chúc một ngày tốt lành!' },
      ],
    },
    {
      id: 'a2-3', level: 'A2', topic: 'Food', title: 'Món ăn yêu thích',
      description: 'Nói về thức ăn, bữa ăn và sở thích ẩm thực hàng ngày.',
      lines: [
        { en: 'My favorite food is pizza.', vi: 'Món ăn yêu thích của tôi là pizza.' },
        { en: 'I eat breakfast every morning.', vi: 'Tôi ăn sáng mỗi buổi sáng.' },
        { en: 'She likes to cook at home.', vi: 'Cô ấy thích nấu ăn ở nhà.' },
        { en: 'We had dinner at a restaurant last night.', vi: 'Tối qua chúng tôi ăn tối ở nhà hàng.' },
        { en: 'Do you want some more cake?', vi: 'Bạn có muốn thêm bánh không?' },
      ],
    },

    // ── B1 ─────────────────────────────────────────────────────────────
    {
      id: 'b1-1', level: 'B1', topic: 'Travel', title: 'Kế hoạch du lịch',
      description: 'Chia sẻ kế hoạch đi du lịch và hỏi kinh nghiệm người khác.',
      lines: [
        { en: 'I am planning a trip to Japan next month.', vi: 'Tôi đang lên kế hoạch đi Nhật Bản vào tháng tới.' },
        { en: 'I want to visit Tokyo and Kyoto.', vi: 'Tôi muốn thăm Tokyo và Kyoto.' },
        { en: 'Have you ever been to Japan before?', vi: 'Bạn đã từng đến Nhật Bản chưa?' },
        { en: 'I heard the food there is absolutely amazing.', vi: 'Nghe nói thức ăn ở đó cực kỳ tuyệt vời.' },
        { en: "I can't wait to try authentic ramen and sushi.", vi: 'Tôi háo hức được thử mì ramen và sushi thật sự.' },
      ],
    },
    {
      id: 'b1-2', level: 'B1', topic: 'Health', title: 'Sức khỏe và bác sĩ',
      description: 'Mô tả triệu chứng và nghe lời khuyên về sức khỏe.',
      lines: [
        { en: "I haven't been feeling well for the past few days.", vi: 'Tôi không khỏe mấy ngày hôm nay.' },
        { en: 'I have a headache and a slight fever.', vi: 'Tôi bị đau đầu và hơi sốt.' },
        { en: 'You should drink plenty of water and get some rest.', vi: 'Bạn nên uống nhiều nước và nghỉ ngơi.' },
        { en: 'The doctor advised me to take these tablets twice a day.', vi: 'Bác sĩ khuyên tôi uống thuốc này hai lần một ngày.' },
        { en: 'I hope you feel better very soon.', vi: 'Tôi mong bạn mau khỏe.' },
      ],
    },
    {
      id: 'b1-3', level: 'B1', topic: 'Daily Routine', title: 'Lịch trình hàng ngày',
      description: 'Kể về thói quen sinh hoạt hàng ngày của bạn bằng tiếng Anh.',
      lines: [
        { en: 'I usually wake up at six thirty in the morning.', vi: 'Tôi thường thức dậy lúc sáu giờ rưỡi sáng.' },
        { en: 'After breakfast, I take the bus to work.', vi: 'Sau bữa sáng, tôi đi xe buýt đến nơi làm việc.' },
        { en: 'I have a lunch break from twelve to one o\'clock.', vi: 'Tôi có giờ nghỉ trưa từ mười hai đến một giờ.' },
        { en: 'In the evenings, I often go for a short walk.', vi: 'Buổi tối, tôi thường đi dạo ngắn.' },
        { en: 'I try to go to bed before eleven at night.', vi: 'Tôi cố gắng đi ngủ trước mười một giờ đêm.' },
      ],
    },

    // ── B2 ─────────────────────────────────────────────────────────────
    {
      id: 'b2-1', level: 'B2', topic: 'Technology', title: 'Công nghệ trong cuộc sống',
      description: 'Thảo luận về tác động của công nghệ đến cuộc sống hiện đại.',
      lines: [
        { en: 'Technology has completely transformed the way we communicate with each other.', vi: 'Công nghệ đã thay đổi hoàn toàn cách chúng ta giao tiếp với nhau.' },
        { en: 'Social media platforms allow people to share information instantly around the world.', vi: 'Các nền tảng mạng xã hội cho phép mọi người chia sẻ thông tin tức thì trên toàn thế giới.' },
        { en: 'However, spending too much time on screens can have negative effects on mental health.', vi: 'Tuy nhiên, dành quá nhiều thời gian trước màn hình có thể ảnh hưởng tiêu cực đến sức khỏe tâm thần.' },
        { en: 'It is important to find a healthy balance between online and offline activities.', vi: 'Quan trọng là phải tìm sự cân bằng lành mạnh giữa hoạt động trực tuyến và ngoại tuyến.' },
        { en: 'Many experts recommend taking regular breaks from digital devices throughout the day.', vi: 'Nhiều chuyên gia khuyến nghị nghỉ ngơi thường xuyên khỏi các thiết bị kỹ thuật số trong ngày.' },
      ],
    },
    {
      id: 'b2-2', level: 'B2', topic: 'Environment', title: 'Môi trường và khí hậu',
      description: 'Từ vựng và cách diễn đạt về các vấn đề môi trường toàn cầu.',
      lines: [
        { en: 'Climate change is one of the most pressing issues facing our planet today.', vi: 'Biến đổi khí hậu là một trong những vấn đề cấp bách nhất mà hành tinh chúng ta đang đối mặt.' },
        { en: 'Carbon emissions from factories and vehicles are contributing to global warming.', vi: 'Khí thải carbon từ nhà máy và phương tiện giao thông đang góp phần gây nóng lên toàn cầu.' },
        { en: 'We all have a responsibility to reduce our environmental footprint.', vi: 'Tất cả chúng ta đều có trách nhiệm giảm dấu chân môi trường của mình.' },
        { en: 'Small actions like recycling and using public transport can make a real difference.', vi: 'Các hành động nhỏ như tái chế và đi phương tiện công cộng có thể tạo ra sự khác biệt thực sự.' },
        { en: 'Governments must implement stronger policies to protect the natural environment.', vi: 'Chính phủ phải thực thi các chính sách mạnh mẽ hơn để bảo vệ môi trường tự nhiên.' },
      ],
    },
    {
      id: 'b2-3', level: 'B2', topic: 'Education', title: 'Giáo dục hiện đại',
      description: 'Quan điểm về vai trò của giáo dục trong xã hội hiện đại.',
      lines: [
        { en: 'A quality education opens doors to better opportunities and a brighter future.', vi: 'Giáo dục chất lượng mở ra cơ hội tốt hơn và tương lai tươi sáng hơn.' },
        { en: 'Students nowadays have access to a vast amount of information through the internet.', vi: 'Học sinh ngày nay có thể tiếp cận lượng thông tin khổng lồ qua internet.' },
        { en: 'However, critical thinking skills are just as important as memorizing facts.', vi: 'Tuy nhiên, kỹ năng tư duy phản biện quan trọng không kém việc ghi nhớ kiến thức.' },
        { en: 'Teachers play a crucial role in inspiring students to reach their full potential.', vi: 'Giáo viên đóng vai trò quan trọng trong việc truyền cảm hứng để học sinh phát huy hết tiềm năng.' },
        { en: 'Investing in education is one of the best things a society can do.', vi: 'Đầu tư vào giáo dục là một trong những điều tốt nhất mà xã hội có thể làm.' },
      ],
    },

    // ── C1 ─────────────────────────────────────────────────────────────
    {
      id: 'c1-1', level: 'C1', topic: 'Global Economy', title: 'Kinh tế toàn cầu',
      description: 'Phân tích xu hướng kinh tế quốc tế với từ vựng học thuật.',
      lines: [
        { en: 'The global economy has become increasingly interconnected over the past several decades.', vi: 'Nền kinh tế toàn cầu đã trở nên ngày càng kết nối chặt chẽ trong vài thập kỷ qua.' },
        { en: 'Multinational corporations now operate across dozens of countries simultaneously.', vi: 'Các tập đoàn đa quốc gia hiện hoạt động tại hàng chục quốc gia cùng một lúc.' },
        { en: 'Economic downturns in one region can rapidly trigger ripple effects worldwide.', vi: 'Suy thoái kinh tế ở một khu vực có thể nhanh chóng gây ra hiệu ứng lan rộng toàn cầu.' },
        { en: 'Policymakers must carefully balance short-term growth with long-term financial stability.', vi: 'Các nhà hoạch định chính sách phải cân bằng cẩn thận giữa tăng trưởng ngắn hạn và ổn định tài chính dài hạn.' },
        { en: 'International cooperation is essential to address challenges that no single country can solve alone.', vi: 'Hợp tác quốc tế là điều thiết yếu để giải quyết những thách thức mà không một quốc gia nào có thể giải quyết một mình.' },
      ],
    },
    {
      id: 'c1-2', level: 'C1', topic: 'AI Ethics', title: 'Đạo đức trong công nghệ AI',
      description: 'Tranh luận về quyền riêng tư, thiên kiến thuật toán và trách nhiệm AI.',
      lines: [
        { en: 'Artificial intelligence raises profound ethical questions about privacy and human autonomy.', vi: 'Trí tuệ nhân tạo đặt ra những câu hỏi đạo đức sâu sắc về quyền riêng tư và quyền tự chủ của con người.' },
        { en: 'As algorithms increasingly influence decisions, accountability becomes more difficult to establish.', vi: 'Khi các thuật toán ngày càng ảnh hưởng đến quyết định, trách nhiệm giải trình trở nên khó xác định hơn.' },
        { en: 'There is growing concern about algorithmic bias and its impact on marginalized communities.', vi: 'Có lo ngại ngày càng tăng về sự thiên kiến thuật toán và tác động của nó đến các cộng đồng bị thiệt thòi.' },
        { en: 'Researchers and policymakers need to collaborate to develop robust ethical frameworks.', vi: 'Các nhà nghiên cứu và nhà hoạch định chính sách cần hợp tác để phát triển các khung đạo đức vững chắc.' },
        { en: 'The pace of technological innovation must not outstrip our capacity for thoughtful regulation.', vi: 'Tốc độ đổi mới công nghệ không được vượt quá khả năng quản lý có suy xét của chúng ta.' },
      ],
    },
    {
      id: 'c1-3', level: 'C1', topic: 'Arts & Culture', title: 'Nghệ thuật và văn hóa',
      description: 'Phân tích vai trò của nghệ thuật trong xã hội và thời đại kỹ thuật số.',
      lines: [
        { en: 'Art serves as a powerful medium through which societies reflect on their collective identity.', vi: 'Nghệ thuật là phương tiện mạnh mẽ qua đó xã hội phản chiếu bản sắc tập thể của mình.' },
        { en: 'Throughout history, artistic movements have both mirrored and challenged prevailing social norms.', vi: 'Suốt lịch sử, các phong trào nghệ thuật đã phản ánh và thách thức các chuẩn mực xã hội đương thời.' },
        { en: 'The digital age has democratized access to art, enabling creators to reach global audiences.', vi: 'Thời đại kỹ thuật số đã dân chủ hóa việc tiếp cận nghệ thuật, giúp người sáng tạo tiếp cận khán giả toàn cầu.' },
        { en: 'Yet this accessibility raises questions about the commercialization and commodification of culture.', vi: 'Nhưng sự tiếp cận này đặt ra câu hỏi về việc thương mại hóa và hàng hóa hóa văn hóa.' },
        { en: 'Preserving cultural heritage remains a complex challenge in an era of rapid globalization.', vi: 'Bảo tồn di sản văn hóa vẫn là thách thức phức tạp trong thời đại toàn cầu hóa nhanh chóng.' },
      ],
    },

    // ── C2 ─────────────────────────────────────────────────────────────
    {
      id: 'c2-1', level: 'C2', topic: 'Philosophy', title: 'Triết học và ý nghĩa cuộc sống',
      description: 'Khám phá các câu hỏi triết học về sự tồn tại và ý chí tự do.',
      lines: [
        { en: 'Philosophers have long grappled with fundamental questions regarding the nature of human existence.', vi: 'Các triết gia từ lâu đã vật lộn với những câu hỏi cơ bản về bản chất của sự tồn tại con người.' },
        { en: 'The tension between determinism and free will continues to provoke rigorous academic debate.', vi: 'Sự căng thẳng giữa thuyết tất định và ý chí tự do vẫn tiếp tục khơi dậy các cuộc tranh luận học thuật nghiêm túc.' },
        { en: 'One might argue that meaning is not discovered but actively constructed through conscious choice.', vi: 'Có thể lập luận rằng ý nghĩa không được khám phá mà được chủ động kiến tạo thông qua sự lựa chọn có ý thức.' },
        { en: 'Existentialist thinkers like Sartre contended that individuals are wholly responsible for their own essence.', vi: 'Các nhà tư tưởng hiện sinh như Sartre cho rằng cá nhân hoàn toàn chịu trách nhiệm về bản chất của chính mình.' },
        { en: 'Ultimately, confronting these questions, however unsettling, may be what distinguishes a truly examined life.', vi: 'Cuối cùng, đối mặt với những câu hỏi này, dù khó chịu, có thể chính là điều phân biệt một cuộc sống được suy nghĩ thực sự.' },
      ],
    },
    {
      id: 'c2-2', level: 'C2', topic: 'Sociology', title: 'Biến đổi xã hội',
      description: 'Phân tích sâu về các lực lượng định hình sự biến đổi xã hội đương đại.',
      lines: [
        { en: 'Societal transformation rarely follows a linear trajectory; it is shaped by complex, intersecting forces.', vi: 'Biến đổi xã hội hiếm khi theo một quỹ đạo tuyến tính; nó được định hình bởi các lực lượng phức tạp, giao thoa nhau.' },
        { en: 'Economic inequality, technological disruption, and shifting cultural values are fundamentally restructuring institutions.', vi: 'Bất bình đẳng kinh tế, gián đoạn công nghệ và sự dịch chuyển của các giá trị văn hóa đang cơ cấu lại các thể chế một cách cơ bản.' },
        { en: 'Historically marginalized groups are increasingly asserting agency and redefining dominant narratives.', vi: 'Các nhóm bị thiệt thòi về mặt lịch sử đang ngày càng khẳng định vai trò chủ động và định hình lại các câu chuyện thống trị.' },
        { en: 'The challenge lies in fostering inclusive dialogue that accommodates divergent perspectives without descending into polarization.', vi: 'Thách thức nằm ở việc thúc đẩy đối thoại bao trùm, dung hòa các quan điểm khác biệt mà không rơi vào phân cực.' },
        { en: 'A genuinely democratic society must continually renegotiate the terms of its social contract.', vi: 'Một xã hội thực sự dân chủ phải liên tục tái đàm phán các điều khoản của khế ước xã hội của mình.' },
      ],
    },
    {
      id: 'c2-3', level: 'C2', topic: 'Science & Humanity', title: 'Khoa học và tương lai nhân loại',
      description: 'Suy ngẫm về hàm ý của tiến bộ khoa học đối với tương lai nhân loại.',
      lines: [
        { en: 'Scientific advancement has conferred upon humanity an unprecedented capacity to reshape the natural world.', vi: 'Tiến bộ khoa học đã trao cho nhân loại năng lực chưa từng có để tái định hình thế giới tự nhiên.' },
        { en: 'Gene editing technologies such as CRISPR offer extraordinary therapeutic potential alongside grave ethical risks.', vi: 'Các công nghệ chỉnh sửa gen như CRISPR mang lại tiềm năng trị liệu phi thường song song với những rủi ro đạo đức nghiêm trọng.' },
        { en: 'As humanity ventures beyond Earth, the philosophical implications of extraterrestrial life profoundly challenge our self-conception.', vi: 'Khi nhân loại vươn ra ngoài Trái Đất, các hàm ý triết học của sự sống ngoài hành tinh thách thức sâu sắc khái niệm tự nhận thức của chúng ta.' },
        { en: 'The synthesis of biology and artificial intelligence may render obsolete many assumptions about cognitive limitation.', vi: 'Sự tổng hợp giữa sinh học và trí tuệ nhân tạo có thể sẽ làm lỗi thời nhiều giả định về giới hạn nhận thức.' },
        { en: 'It falls upon each generation to ensure that scientific progress serves the flourishing of all sentient beings.', vi: 'Trách nhiệm đặt lên mỗi thế hệ là đảm bảo rằng tiến bộ khoa học phục vụ cho sự phồn thịnh của tất cả chúng sinh.' },
      ],
    },
  ]);

  readonly lessons = this._lessons.asReadonly();
}
