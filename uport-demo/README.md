検証内容

大学卒業後、就職先に学歴証明を求められるケースを想定する。
大学および就職先はuPortによるKYCを導入済みであった場合、
どのような手続きになるのか？を確認したい。

個人のuPort IDが学生のものであることを証明するには？
（名前・生年月日で学歴証明書を発行する学校もあるみたい。本当？）
・オフライン上で身分証明書を提示して事務手続き（uPort使う意味ない）
・学生証にQRコードがある、とか（落としたら学歴証明書もゲット、ダメだー）
やはり市役所から本人証明できるクレームを発行してもらったほうが良い。

市役所は、オフライン上で身分証明書と併せて本人確認を行い、本人証明済みのクレームを発行する
大学側は、市役所のクレームを通して本人確認を行い、学歴証明書を発行する
就職先は、大学が発行したクレームを検証して学歴証明を確認する

やってみた感想
uPort SDKを使えば発行されたクレームがDIDドキュメントとしてサーバ側（大学や企業側）で閲覧できる。
DIDドキュメントには発行者のDIDが確認できる。
[重要] ところで、大学や企業のDIDが正しいことを確認するのはどうすれば？？
[重要] クレームのキー情報の決め方ってとても重要っぽい。
キー名が被った場合、最新のクレームが送られている・・・模様（不確か）。